import {DateTime} from "luxon";

export class SyncExpansionJpnCardPricesMessageHandler {
    constructor(api, tcgCardPriceRepository, tcgExpansionMetadataRepository) {
        this.api = api;
        this.tcgCardPriceRepository = tcgCardPriceRepository;
        this.tcgExpansionMetadataRepository = tcgExpansionMetadataRepository;
    }

    static getId = () => {
        return 'SyncJapanesePrices';
    }

    handle = async (payload) => {
        const expansionId = payload.expansionId;
        const sets = (await this.api.getSets()).filter(set => set.name.toLowerCase() === expansionId.toLowerCase());
        if (sets.length !== 1) {
            throw new Error(`Prices for expansion "${expansionId}" not found`);
        }

        const set = sets.at(0);
        const cards = await this.api.getCardsForSet(set.set_code);

        for (const card of cards.data) {
            await this.tcgCardPriceRepository.save({
                cardId: parseInt(card.cardUrl.replace('https://tcgcollector.com/cards/', '')),
                cardNumber: card.sequenceNumber,
                expansionId: expansionId,
                prices: card.prices,
            });
        }

        this.tcgExpansionMetadataRepository.save({
            expansionId: expansionId,
            lastPriceSync: DateTime.now().toISO()
        })

    }
}