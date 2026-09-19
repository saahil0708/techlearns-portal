export interface InvitationLinkItem {
    email: string;
    activationUrl: string;
}
export interface BulkInviteResult {
    invited: number;
    expiresInHours: number;
    invitationLinks?: InvitationLinkItem[];
}
export declare class InvitationLinkItemType implements InvitationLinkItem {
    email: string;
    activationUrl: string;
}
export declare class BulkInviteResultType implements BulkInviteResult {
    invited: number;
    expiresInHours: number;
    invitationLinks?: InvitationLinkItemType[];
}
