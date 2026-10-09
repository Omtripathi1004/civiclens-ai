import { Complaint, DuplicateCandidate } from '../types';

// Calculate Haversine distance in meters
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Tokenize and compute Jaccard word similarity (0 to 1)
export function computeTokenSimilarity(textA: string, textB: string): number {
  const cleanTokens = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const tokensA = cleanTokens(textA);
  const tokensB = cleanTokens(textB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

export function findDuplicateCandidates(
  target: {
    id: string;
    description: string;
    category: string;
    coordinates: { lat: number; lng: number } | null;
    createdAt: string;
  },
  existingComplaints: Complaint[],
  distanceThresholdMeters: number = 500,
  timeWindowHours: number = 72
): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];

  for (const item of existingComplaints) {
    if (item.id === target.id) continue;

    // 1. Category check
    const isSameCategory = item.category === target.category;

    // 2. Geographic distance
    let geoDist = 99999;
    let geoScore = 0;
    if (target.coordinates && item.coordinates) {
      geoDist = calculateHaversineDistanceMeters(
        target.coordinates.lat,
        target.coordinates.lng,
        item.coordinates.lat,
        item.coordinates.lng
      );
      if (geoDist <= 50) geoScore = 1.0;
      else if (geoDist <= 150) geoScore = 0.85;
      else if (geoDist <= 300) geoScore = 0.65;
      else if (geoDist <= distanceThresholdMeters) geoScore = 0.45;
    }

    // 3. Text overlap similarity
    const textSim = computeTokenSimilarity(target.description, item.rawDescription);

    // 4. Time delta
    const tTarget = new Date(target.createdAt).getTime();
    const tItem = new Date(item.createdAt).getTime();
    const diffHours = Math.abs(tTarget - tItem) / (1000 * 3600);
    const timeScore = diffHours <= timeWindowHours ? Math.max(0.2, 1 - diffHours / timeWindowHours) : 0;

    // Weighted composite score (0 to 100)
    // If geo distance exists: 45% Geo, 35% Text, 20% Time
    // If no geo: 65% Text, 35% Time
    let composite = 0;
    if (target.coordinates && item.coordinates) {
      composite = (geoScore * 0.45 + textSim * 0.35 + timeScore * 0.20) * (isSameCategory ? 1.0 : 0.6) * 100;
    } else {
      composite = (textSim * 0.65 + timeScore * 0.35) * (isSameCategory ? 1.0 : 0.6) * 100;
    }

    const roundedScore = Math.round(composite);

    // Only consider candidates with > 38% match
    if (roundedScore >= 38) {
      let reason = '';
      if (geoDist <= 100 && textSim > 0.4) {
        reason = `High confidence duplicate: Same defect located ${geoDist}m away with ${(textSim * 100).toFixed(0)}% vocabulary overlap reported ${diffHours.toFixed(1)}h apart.`;
      } else if (geoDist <= 300) {
        reason = `Spatial clustering: Located ${geoDist}m away in same municipal ward within recent ${diffHours.toFixed(0)}h reporting window.`;
      } else {
        reason = `Textual similarity match: ${(textSim * 100).toFixed(0)}% semantic overlap on civic asset and symptoms.`;
      }

      candidates.push({
        targetId: item.id,
        targetRef: item.trackingNumber,
        targetTitle: item.title,
        textSimilarity: Math.round(textSim * 100),
        geoDistanceMeters: geoDist === 99999 ? -1 : geoDist,
        timeDiffHours: Math.round(diffHours * 10) / 10,
        overallScore: roundedScore,
        reason,
        status: 'Candidate'
      });
    }
  }

  // Sort candidates by highest match score
  return candidates.sort((a, b) => b.overallScore - a.overallScore);
}
