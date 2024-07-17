import {contains} from "../Infrastructure/Utils";

export class HidePricesFeature {
    constructor(settings) {
        this.settings = settings;
    }

    getId = () => {
        return 'hide-prices-feature';
    };

    needsToBeAppliedForLocation = (currentLocation) => {
        return this.settings.hidePrices();
    }

    apply = () => {
        contains('*', /\$([\d]+\.?\d*)/g).forEach(element => {
            element.innerHTML = element.innerHTML.replace(/\$([\d]+\.?\d*)/g, '$—')
        });
    }

}