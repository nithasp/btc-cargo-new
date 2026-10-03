export interface ExchangeMoneyStore {
    activeStage: ExchangeMoneyActiveStage,
    paymentMethod: PaymentMethod,
}

export enum ExchangeMoneyActiveStage {
    All = "all",
    New = "new",
    Summary = "summary"
}

export enum PaymentMethod {
    Bank = "bank",
    Alipay = "alipay"
}

export enum VerificationStates {
    Unverified = "unverified",
    Verified = "verified",
    Reviewing = "reviewing",
    Waiting = "waiting"
}

export enum FormState {
    SelectAccount = "selectAccount",
    PaymentDetails = "paymentDetails"
}

export enum AccountType {
    Detail = "detail",
    Image = "img"
}

export interface UploadFile {
  filename: string
  url: string
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

export interface ExchangeState {
    verification_state: VerificationStates
    yuan_balance: number
}

export interface CurrencyServiceStatus {
    status: boolean
}

export interface PaymentCurrency {
    name: string
    is_online: boolean
    rate: number
    created_at: Date
    modified_at: Date
}

export interface PaymentCurrencyResponse {
    payment: PaymentCurrency
}

export interface AmountSplit {
    credit_amount: number
    wallet_id: number
    use_credit_amount: number
}
export interface PaymentDetails {
    amount: number
    description?: string
    payment_gateway_type: PaymentMethod
    alipay_account_id?: number
    account_type?: AccountType,
    account_name?: string
    account_number?: string
    account_url?: string
    amount_split?: AmountSplit[]
}