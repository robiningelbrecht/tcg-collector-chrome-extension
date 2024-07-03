export class NewMenuItemFeature {
    constructor(settings) {
        this.settings = settings;
    }

    getFeatureDescription = () => {
        return 'New menu item';
    };

    getReasonsForFailure = async () => {
        const failureReasons = [];
        if (document.querySelectorAll('div#navbar-buttons').length === 0) {
            failureReasons.push('Proper html element to attach menu items to not found ');
        }
        if (!this.settings.googleSpreadSheetId) {
            failureReasons.push('Google Spreadsheet ID not configured');
        }

        return failureReasons;
    }


}