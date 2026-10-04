export enum VerificationStates {
    Unverified = "unverified",
    Verified = "verified",
    Reviewing = "reviewing",
    Waiting = "waiting"
}

export interface CreatedVerificationItem {
    id: number
    state: VerificationStates
    partner: Partner
    images: ImageUrl[]
}

interface Partner {
    id: number
    name: string
}

interface ImageUrl {
    id: number
    url: string
    image_category: string
}
