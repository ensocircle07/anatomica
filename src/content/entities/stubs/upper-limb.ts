// Upper-limb structures referenced by the seed records but not written yet (ADR-0011 D1).
// They exist so references resolve; the coverage report lists them as missing.

import type { StubEntity } from "../../schema/index.ts";
import { stub } from "../_helpers.ts";

export const upperLimbStubs: StubEntity[] = [
  // Bone features
  stub("feature.scapula.infraglenoid-tubercle", "bone-feature", "Infraglenoid tubercle of scapula", ["upper-limb.shoulder"], ["osteology"]),
  stub("feature.humerus.anteromedial-surface", "bone-feature", "Anteromedial surface of humerus", ["upper-limb.arm"], ["osteology"]),
  stub("feature.humerus.anterolateral-surface", "bone-feature", "Anterolateral surface of humerus", ["upper-limb.arm"], ["osteology"]),
  stub("feature.humerus.lateral-epicondyle", "bone-feature", "Lateral epicondyle of humerus", ["upper-limb.arm"], ["osteology", "landmarks"]),
  stub("feature.ulna.olecranon", "bone-feature", "Olecranon", ["upper-limb.forearm"], ["osteology", "landmarks"]),
  stub("feature.ulna.coronoid-process", "bone-feature", "Coronoid process of ulna", ["upper-limb.forearm"], ["osteology"]),
  stub("feature.ulna.tuberosity", "bone-feature", "Tuberosity of ulna", ["upper-limb.forearm"], ["osteology"]),

  // Joints
  stub("joint.glenohumeral", "joint", "Glenohumeral joint", ["upper-limb.shoulder"], ["arthrology"]),
  stub("joint.elbow", "joint", "Elbow joint", ["upper-limb.arm", "upper-limb.forearm"], ["arthrology"]),

  // Fascia
  stub("fascia.arm.lateral-intermuscular-septum", "fascia", "Lateral intermuscular septum of arm", ["upper-limb.arm"], ["myology"]),
  stub("fascia.arm.medial-intermuscular-septum", "fascia", "Medial intermuscular septum of arm", ["upper-limb.arm"], ["myology"]),

  // Muscles
  stub("muscle.teres-minor", "muscle", "Teres minor", ["upper-limb.shoulder"], ["myology"]),
  stub("muscle.teres-major", "muscle", "Teres major", ["upper-limb.shoulder"], ["myology"]),
  stub("muscle.subscapularis", "muscle", "Subscapularis", ["upper-limb.shoulder"], ["myology"]),
  stub("muscle.deltoid", "muscle", "Deltoid", ["upper-limb.shoulder"], ["myology"]),
  stub("muscle.coracobrachialis", "muscle", "Coracobrachialis", ["upper-limb.arm"], ["myology"]),
  stub("muscle.biceps-brachii", "muscle", "Biceps brachii", ["upper-limb.arm"], ["myology"]),
  stub("muscle.brachioradialis", "muscle", "Brachioradialis", ["upper-limb.forearm"], ["myology"]),

  // Nervous
  stub("plexus-part.brachial.posterior-cord", "plexus-part", "Posterior cord of brachial plexus", ["upper-limb.axilla"], ["neurology"]),
  stub("plexus-part.brachial.lateral-cord", "plexus-part", "Lateral cord of brachial plexus", ["upper-limb.axilla"], ["neurology"]),

  // Arteries
  stub("artery.axillary", "artery", "Axillary artery", ["upper-limb.axilla"], ["angiology"]),
  stub("artery.brachial", "artery", "Brachial artery", ["upper-limb.arm"], ["angiology"]),
  stub("artery.anterior-circumflex-humeral", "artery", "Anterior circumflex humeral artery", ["upper-limb.shoulder"], ["angiology"]),
  stub("artery.superior-ulnar-collateral", "artery", "Superior ulnar collateral artery", ["upper-limb.arm"], ["angiology"]),

  // Spaces and compartments
  stub("space.axilla", "space", "Axilla", ["upper-limb.axilla"], ["topography"]),
  stub("space.triangular-interval", "space", "Triangular interval", ["upper-limb.arm"], ["topography"]),
  stub("compartment.arm.anterior", "compartment", "Anterior compartment of arm", ["upper-limb.arm"], ["topography"]),
];
