export interface Incident {
  id: string;
  helperId: string;           // Links to existing helper
  incidentDate: string;       // When it happened
  description: string;        // What happened
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;         // Staff member who reported
  mediaUrls: string[];        // Google Drive file URLs
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;        // How it was resolved
  createdAt: string;
}