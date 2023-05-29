enum ApplicationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DENIED = "DENIED",
}

enum Permissions {
    VIEW_CARDS = "VIEW_CARDS",
    VIEW_APPLICATIONS = "VIEW_APPLICATIONS",
    UPDATE_SETTINGS = "UPDATE_SETTINGS",
    UPDATE_BADGES = "UPDATE_BADGES",
    SELL_CARDS = "SELL_CARDS",
    BUY_CARDS = "BUY_CARDS",
}

export { ApplicationStatus, Permissions };