# Is the air beside idling scooters above the guideline? What the physics gives

ESTIMATE (推估) from a 3-D air-flow simulation, signed 2026-11-27. Not a measurement. Details: `METHOD.md`; numbers: `results-simulation.json`.

## The direct answer

**For a pedestrian waiting at a red light: no. Carbon monoxide at the kerb is below the WHO guideline in every case we simulated, typical or worst.** The WHO value is 87 ppm averaged over 15 minutes.

- **Waiting through one red** adds about 0.1 to 1 ppm to your 15-minute average in ordinary conditions, about 1 to 4 ppm when the wind blows from a dozen scooters straight at you for the whole red, and up to about 5 ppm (40 in a bad case) if a pushchair sits 0.5 m directly downwind of a tailpipe in near-calm air. All well below 87.
- **Standing at the kerb through every red for 15 minutes** with the wind held from a pack of scooters gives about 3 to 16 ppm at child and pushchair height. Still 5 to 25 times below 87.
- **The one realistic case that does go above it**: a pushchair parked 0.5 m directly downwind of an idling scooter's tailpipe, at 0.6 m height, every red for 15 minutes, while near-calm air (about 0.4 m/s) keeps blowing the same way. The median is 35 to 56 ppm, and about 1 in 10 to 1 in 5 such quarter-hours goes above 87 ppm; the 1-hour value (31 ppm) is passed in most such hours. Light wind from that direction happens in about 1 % of reds, and holding it for 15 minutes is much rarer. Half a metre sideways, or child height (1.1 m), and it disappears. This is our least certain result (very still air in the model, fine grid not fully converged).

## What is above its line

- **The smell.** Downwind of a dozen idling scooters, the exhaust at your nose is above the level people can smell in most seconds of the red, and clearly smellable (5 times threshold) in about half of them or more. Next to a badly tuned scooter it is far stronger. This is what you experienced. Your nose detects unburnt fuel and partial-combustion products at parts per billion. Carbon monoxide has no smell, so a horrible smell does not mean the CO is near its guideline.
- **Petrol-fuel vapour.** Second-long hydrocarbon hits at 0.5-1 m are above the odour threshold of petrol vapour in most cases.
- **Benzene, for people who stay.** For a vendor, police officer or crossing guard who stands at the kerb for an hour with the wind blowing from the scooters, benzene reaches about 1 to 4 times California's 1-hour reference level (8.5 ppb; derived on a 6-hour basis). A pedestrian waiting one red adds a small fraction of it.
- **Seconds-long CO hits, compared with the only value made for seconds.** In near-calm air 0.5 m downwind of a single tailpipe at pushchair height, a second above 200 ppm happens in about a third of reds. More generally: Close to a tailpipe CO comes in hits of tens to a few hundred ppm lasting a second. The US workplace ceiling of 200 ppm (an instantaneous value for workers) is crossed for a second or two in about 1 % of held-wind reds with ordinary scooters, and in about half of them when the nearest scooter is badly tuned. Such reds are at most about 0.1 % of rush-hour reds. These are not comparable with the 15-minute guideline.
- **Irritants (acrolein) for people who stay:** cannot be ruled out; no idle measurements exist, so this is not assessed properly.

## What the simulation adds that the old estimate lacked

- **Second-by-second hits.** The old estimate gave only 90-second averages (about 0.3 ppm for a dozen scooters). At 0.5 m the highest second is typically 5 to 30 ppm, sometimes 100 to 300. These seconds are what you smell.
- **Pushchair and child height.** When the wind blows from the scooters to you, air at pushchair height (0.7 m) holds up to about twice what an adult breathes at 1.5 m, and knee height more still. Right behind one tailpipe in near-calm air the plume stays at 0.6-0.8 m and the difference is many times.
- **Wind straight from the pack.** Held for a whole red, it raises the 90-second kerb average about 10 times above the published estimate's median (to about 3-12 ppm from 0.5 to 4 m). How often a red is like that is not known; at most about 1 in 8 rush-hour reds.
- **Behind the last row.** Standing 0.5 m behind a queue with the wind across it: about 6 ppm average and 40-130 ppm for the highest second.
- **Arcades (騎樓).** With a light wind from the scooters toward an arcade, the kerb edge in front of it gets about 7 ppm on average over the red at pushchair height (seconds of 50-300 ppm). Air 1-3 m inside the arcade stays lower, about 1-4 ppm, but is not clean. Whether exhaust builds up over many cycles was not simulated. (A first arcade run was withdrawn: its model box was too low and pushed values up.)
- **Street canyons.** Not settled: the canyon runs were affected by how air was fed into the model and probably read 2 to 5 times low.
- **The pull-away at green** was not simulated.

## What it would take to reach the guideline, and whether any real place comes close

Apart from the plume core of a single tailpipe at pushchair height in held, near-calm air (above), to hold 87 ppm for 15 minutes the fresh air passing you would have to fall below about 1.3 m³ per second for 30 idling scooters. An open street moves tens to hundreds. Outdoors it would need a nearly sealed space, far dirtier engines, or both. **Enclosed places can**: an underground scooter park with engines idling at the ramps, a queue held inside an underpass or a covered waiting area with little through-air, a tunnel with slow scooter traffic. Hong Kong underground car parks measured 15-minute averages of 39 ppm on average and up to 362 ppm. No Taiwanese measurement of any such place was found, and none was simulated. Thirty years ago, in the two-stroke era, Taipei roadsides averaged about 8 ppm over half an hour and once reached 101 ppm; today's fleet emits several times less.

## How sure

Low to moderate for every number. One simulated red per case; a coarse grid near the tailpipes (seconds-long values uncertain by about 3 times either way); several assumptions (engine heat, exhaust temperature and angle). The "no" for a waiting pedestrian survives every correction made. The finer near-tailpipe grid made the very-near-field worse, not better: that is where the one exceedance appeared, and seconds-long values at pushchair height are probably about 3 times higher than the pack runs show. The smell answer rests on 1960s odour panels for car exhaust and is reliable only as "smellable in many seconds downwind".
