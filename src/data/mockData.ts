export type ReportStatus = 'In Progress' | 'Received' | 'Resolved';
export type SeverityLevel = 'CRITICAL' | 'MEDIUM' | 'LOW';

export interface ReportEvent {
  readonly id: string;
  readonly label: string;
  readonly at: string;
}

export interface ActiveReport {
  readonly id: string;
  readonly title: string;
  readonly address: string;
  readonly status: ReportStatus;
  readonly reported: string;
  readonly estimate: string;
  readonly imageUrl: string | null;
  readonly aiVerified: boolean;
  readonly urgent: boolean;
  readonly events: readonly ReportEvent[];
}

export interface CommunityFix {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly thanks: number;
  readonly fixedOn: string;
  readonly imageUrl: string | null;
  readonly icon?: string;
}

export interface QuickStat {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly icon: string;
  readonly tone: 'primary' | 'action';
}

export interface CategoryOption {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly selected?: boolean;
}

export interface AiAssessment {
  readonly category: string;
  readonly severity: 'High' | 'Medium' | 'Low';
  readonly department: string;
  readonly reasoning: string;
  readonly confidence: number;
}

export interface QueueItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly address: string;
  readonly severity: SeverityLevel;
  readonly aiSummary: string;
  readonly imageUrl: string;
  readonly status: QueueStatus;
  readonly assignedTo?: string;
  readonly assignedCrew?: string;
}

export type QueueStatus = 'Pending' | 'Assigned' | 'Resolved';

export const DEPARTMENTS: readonly string[] = [
  'Roads & Infrastructure',
  'Street Lighting',
  'Sanitation & Waste',
  'Drainage & Flood',
  'Parks & Public Space',
  'Facilities & Buildings',
];

export const CREW_BY_DEPARTMENT: Record<string, readonly string[]> = {
  'Roads & Infrastructure': ['Roads Crew A', 'Roads Crew B', 'Paving Unit'],
  'Street Lighting': ['Lighting Crew', 'Electrical Team'],
  'Sanitation & Waste': ['Sanitation Team 1', 'Sanitation Team 2'],
  'Drainage & Flood': ['Drainage Crew', 'Pump Station Team'],
  'Parks & Public Space': ['Parks Crew', 'Grounds Team'],
  'Facilities & Buildings': ['Facilities Crew', 'Building Maintenance'],
};

const TYPE_TO_DEPARTMENT: Record<string, string> = {
  Pothole: 'Roads & Infrastructure',
  Graffiti: 'Facilities & Buildings',
  Streetlight: 'Street Lighting',
  'Illegal Dumping': 'Sanitation & Waste',
};

export function suggestDepartment(type: string): string {
  for (const key of Object.keys(TYPE_TO_DEPARTMENT)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return TYPE_TO_DEPARTMENT[key];
  }
  return DEPARTMENTS[0];
}

export const USER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBBxLZ_JDM0wnLMdbl_b3GhL6doFcnUjobtxgtZzkWv6se5p7tBfNs9kXYuMINRnJ_NG9AuSwIStukCdxjUT_4gNa35aylen3ZPua_xL3WWRZMKwECDPnX013mVOKgpTLXy7ahFBVVn_RgdIemHOOnb16yV385-fJ5UloSnLGjaKh3daoHFxZUWm-MXF31jmFDnJWUVFX_OLgH5oafe01iehWzFyY4Ma8sNX6Q_ahdpdfBMUL76-5GicQ';

export const CITY_BACKGROUND =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBnwAIl7Knxfk6Hw34DCDE9dY-U_PiU6E9890SthLMW4h3OjqFyCHzWqFq-t36QVVrx1hQiQIY7j8MejYkYISKpsPRw7if6eoQFYmCmw3a2Q7oxaH6XZg5k6F-PGzfWDdOq8NtYm-H0k3DG4LW6n_tVjZRO2dPnD4CCT9Nz6PgBsPLcFZ8vN0YRrAfZI6h2xzQzDOSqa83jiEPM376teMFxuCiYcwNZoClLQKTk3j5fQC6xUtM6nV6TkA';

export const POTHOLES_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_OY6OvMz-bFk6afCWQXShQPiPm4HIvILcT5_amqvK4UZRm0wHkcW7l4L4aySKitY1FuVLi3ULN5heZkQqTrihDFMKq_KvkMy0I9VeqgZ00N8dpliFLdCpCsQ_eMYIGtV0RrkQP3iQ69TbDwnbt_Aaw7uYmjVIbhynWeFwBvF8gyK9DcCUVcFVirYjV6qrDMrk9xlg04eclNQm5LzgJoqxLJ3miwa1bY9JoIcptwDW7JT52UfOnWPI4w';

export const SIDEWALK_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJRdbz18KmpOLMZg6lk3QBQKXZFpzaAddXq1j_bvmqpNXd8_IqxnQv5X9ZvneBxnd3CbX8mNndU4l6nDUX8-OQ23e6-6QPS6oHTehwzuEvfhWSWs_tzandtjxytd45t43N0cu-Icm0CIO1l6Fnw_ZAH8FBfmDlN09Py_fIPlSGZyY0Qx9fYJjOxrF2FcnVJ0gmIeL5cPDi9P9gvUaXvc3irOmhPSXL9nnb1PoYkYCVDd0hHIIH3ZnLzQ';

export const SEATTLE_MAP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3bFzH4BS71ru0MPFQgPLQrFBE-vnEP6kPVdM6NNESD8oENbSwWYkWo9LGpES1QfAY_Qscv0wWk0DnPcbNJYrN046JEtcE2qpmPyIziTjKvoR64vaLMwafPoZ1K9_ri0MFyIh7Prg_6pHfw2146BjfmyzCFNzIczWzm4AnaS2I4DKPK8eZL7bdY3_PM-11QToowLivU6MP_8o41CGmXR4OrCR0mh4tS-PY0KzYnT3rehCPyYFuM4p0kA';

export const POTHOLES_CLOSEUP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQDdu_13NpOomYkD3YaY44ZSTYW5NkkZ3ESCUY0OZ3WtCUTjI3EzxEv9wvMbW0oo1MAPGtNJ0LFdYAcO0dAacCewD9Sxd7hSoeIMpixfg5wsYyJO4sJjF3B3_m_Q0s_RSctjwjnSvU6CHkkU9WZlgdChltynnpSiguj_RiI8A7xZ3DSOVscK3sVIvXRVtXq4yBsasp63xSF5QlxuhEFNUIqiJVxurYZ-IGnS_FybxkOt3LadZ1rAT9Og';

export const MAP_DASHBOARD_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIfBkluPhvQN-nZJWXhc2eK104SLShDSKlrId0QpZ9AMted7dQlQ9XRFOSUrZaOKD86WtC5GABrxjV5hcZerNs83mZUK-LLl_vvzleCh1vyGRKIzopt1CLfXasF4BkcX4_fN_wup4CdKupFacTCKIyL9NP7vNVFM88qGTgzPnOFMiW9E11e6ZXUfX3Hic_fry-TNd0ayg_TGZYYmCuu12KJKaZ1kYICa343I95cSKpBiZ1sW4bQzpiSA';

export const GRAFFITI_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC2nzaEoXhWzxOiAmpAVqjVLqAAxUzcnUQWLAZ9ATcZLIb9_8gQlnsaOdBMLqP9gpCWwgyW0sNKUa8VIKZEEvQx6oCtenimiiiBMU7gLbSaxR4RjDs49NvFlG-32ns8fwF82GyYVqcPRMrscXwUvCRJgZa6EOOt-KR9Emj25Mp_XedNpo3Xn2tYKVhYvrTflSANyxM_zqBKXiXPbZhqfRlp8ReyDzTHUihW842RKjUCgC0wbr6eLnLypQ';

export const QUICK_STATS: readonly QuickStat[] = [
  {
    id: 'resolution',
    value: '24h',
    label: 'Avg Resolution',
    icon: 'bolt',
    tone: 'action',
  },
  {
    id: 'citizens',
    value: '1.2k',
    label: 'Active Citizens',
    icon: 'group',
    tone: 'primary',
  },
];

const REPORT_NOW = Date.now();
const R_MIN = 60 * 1000;
const R_HOUR = 60 * R_MIN;
const R_DAY = 24 * R_HOUR;

export const ACTIVE_REPORTS: readonly ActiveReport[] = [
  {
    id: 'rpt-001',
    title: 'Pothole on Ashram Road',
    address: 'Ashram Road, near Usmanpura',
    status: 'In Progress',
    reported: '2d ago',
    estimate: 'Est. Fix: Oct 26',
    imageUrl: POTHOLES_IMG,
    aiVerified: true,
    urgent: true,
    events: [
      { id: 'reported', label: 'Reported', at: new Date(REPORT_NOW - 2 * R_DAY - 3 * R_HOUR).toISOString() },
      { id: 'verified', label: 'AI Verified', at: new Date(REPORT_NOW - 2 * R_DAY - 3 * R_HOUR + 3 * R_MIN).toISOString() },
      { id: 'in-progress', label: 'In Progress', at: new Date(REPORT_NOW - 6 * R_HOUR).toISOString() },
    ],
  },
  {
    id: 'rpt-002',
    title: 'Broken Streetlight',
    address: 'Maninagar, near Krishna Bridge',
    status: 'Received',
    reported: '1d ago',
    estimate: 'Pending Schedule',
    imageUrl: null,
    aiVerified: true,
    urgent: false,
    events: [
      { id: 'reported', label: 'Reported', at: new Date(REPORT_NOW - R_DAY - 2 * R_HOUR).toISOString() },
      { id: 'verified', label: 'AI Verified', at: new Date(REPORT_NOW - R_DAY - 2 * R_HOUR + 2 * R_MIN).toISOString() },
      { id: 'received', label: 'Received', at: new Date(REPORT_NOW - R_DAY + 4 * R_HOUR).toISOString() },
    ],
  },
];

export const COMMUNITY_FIXES: readonly CommunityFix[] = [
  {
    id: 'fix-001',
    title: 'Sidewalk Repair Complete',
    description: 'Tripping hazard removed and new concrete poured on Navrangpura main road.',
    thanks: 24,
    fixedOn: 'Oct 25',
    imageUrl: SIDEWALK_IMG,
  },
  {
    id: 'fix-002',
    title: 'Fallen Tree Cleared',
    description: 'Parks dept cleared debris blocking the path at Sabarmati Riverfront Park.',
    thanks: 56,
    fixedOn: 'Oct 23',
    imageUrl: null,
    icon: 'park',
  },
];

export const ISSUE_CATEGORIES: readonly CategoryOption[] = [
  { id: 'road', label: 'Road/Pothole', icon: 'directions_car', selected: true },
  { id: 'sanitation', label: 'Sanitation' },
  { id: 'lighting', label: 'Lighting/Power' },
  { id: 'graffiti', label: 'Graffiti' },
];

export const INITIAL_ADDRESS = 'Ashram Road, Ahmedabad, Gujarat 380009';

export const AI_ASSESSMENT: AiAssessment = {
  category: 'Pothole',
  severity: 'High',
  department: 'Roads & Infrastructure',
  reasoning:
    'Image shows deep pavement damage on a high-traffic road. Structural integrity appears compromised, requiring prompt attention to prevent vehicular damage.',
  confidence: 0.75,
};

export const DUPLICATE_ALERT = {
  heading: 'Potential Duplicate',
  body: "A similar 'Pothole' report was logged",
  distance: '50m away',
  actionLabel: 'View original report',
};

export const QUEUE_ITEMS: readonly QueueItem[] = [
  {
    id: 'queue-001',
    type: 'Infrastructure: Pothole',
    title: 'Deep pothole reported on Ashram Road',
    address: 'Ashram Road & Usmanpura, Ahmedabad',
    severity: 'CRITICAL',
    aiSummary: 'Deep pothole reported on Ashram Road, risking tire damage. Multiple similar reports clustered within 500ft.',
    imageUrl: MAP_DASHBOARD_IMG,
    status: 'Pending',
  },
  {
    id: 'queue-002',
    type: 'Vandalism: Graffiti',
    title: 'Graffiti on Public Library wall',
    address: 'British Library, Ashram Road',
    severity: 'MEDIUM',
    aiSummary: 'Extensive graffiti on historical municipal building. Non-offensive content detected. Recommends standard cleanup queue.',
    imageUrl: GRAFFITI_IMG,
    status: 'Pending',
  },
  {
    id: 'queue-003',
    type: 'Infrastructure: Streetlight',
    title: 'Broken streetlight near Maninagar',
    address: 'Maninagar, near Krishna Bridge',
    severity: 'MEDIUM',
    aiSummary: 'Non-functional streetlight on a pedestrian-heavy corner. Reduced visibility at night reported by multiple citizens.',
    imageUrl: MAP_DASHBOARD_IMG,
    status: 'Assigned',
  },
  {
    id: 'queue-004',
    type: 'Sanitation: Illegal Dumping',
    title: 'Piles of debris behind Bapunagar lot',
    address: 'Bapunagar, behind Odhav Industrial Estate',
    severity: 'LOW',
    aiSummary: 'Construction debris and household waste dumped on municipal property. Recommended cleanup within 7 days.',
    imageUrl: GRAFFITI_IMG,
    status: 'Assigned',
  },
  {
    id: 'queue-005',
    type: 'Infrastructure: Pothole',
    title: 'Pothole repaired near Gujarat University',
    address: 'Navrangpura, near Gujarat University',
    severity: 'LOW',
    aiSummary: 'Crew completed asphalt patch. Quality check passed; area monitored for recurrence.',
    imageUrl: MAP_DASHBOARD_IMG,
    status: 'Resolved',
  },
  {
    id: 'queue-006',
    type: 'Lighting: Public Park',
    title: 'Park lamp replaced at Sabarmati Riverfront',
    address: 'Sabarmati Riverfront Park, Main Entrance',
    severity: 'LOW',
    aiSummary: 'Replacement lamp installed and verified operational. Case closed after 48h follow-up.',
    imageUrl: MAP_DASHBOARD_IMG,
    status: 'Resolved',
  },
];

export const PROCESSING_STATUS = [
  { label: 'Duplicate Detection', value: '94% Active', percent: 94 },
  { label: 'Auto-Triage Accuracy', value: '98%', percent: 98 },
];
