import {icon} from "../Component/Icon";

export class PrintBinderExpansionLogosFeature {
    constructor() {
        this.isPrintNavigationSetUp = false;
        this.isSyncScheduled = false;
        this.observer = null;
        this.renderedSignature = null;
        this.$printWrapper = null;
    }

    getId = () => {
        return 'print-binder-expansion-logos';
    };

    needsMutationObserver = () => {
        return false;
    };

    needsToBeApplied = (appState) => {
        return appState.getRouteName() === 'sets_page';
    }

    getPrintWrapper = () => {
        if (!this.$printWrapper) {
            this.$printWrapper = document.createElement('div');
            this.$printWrapper.setAttribute('id', 'print');
            document.body.appendChild(this.$printWrapper);
        }

        return this.$printWrapper;
    }

    updateSelectionCount = () => {
        const $count = document.querySelector('.print-navigation button.print span.count');
        if ($count) {
            $count.innerHTML = document.querySelectorAll('input[type="checkbox"][data-expansion-id]:checked').length;
        }
    }

    syncSelectableSets = () => {
        const $expansions = Array.from(document.querySelectorAll('.set-logo-grid-item'))
            .filter($expansion => $expansion.querySelector('img.set-logo-grid-item-logo'));

        const signature = $expansions.map($expansion => $expansion.getAttribute('data-set-id')).join(',');
        const hasExpansionsWithoutCheckbox = $expansions.some($expansion => !$expansion.querySelector(':scope > label'));
        if (signature === this.renderedSignature && !hasExpansionsWithoutCheckbox) {
            return;
        }
        this.renderedSignature = signature;

        const $printWrapper = this.getPrintWrapper();
        $printWrapper.replaceChildren();

        $expansions.forEach($expansion => {
            const logoUri = $expansion.querySelector('img.set-logo-grid-item-logo').getAttribute('src');
            const expansionId = $expansion.getAttribute('data-set-id');

            const $placeholder = document.createElement('div');
            $placeholder.classList.add(...['expansion']);
            $placeholder.setAttribute('data-expansion-id', expansionId);
            $placeholder.innerHTML += `<img src="${logoUri}" class="logo" alt="Expansion logo"/>`;

            const $symbol = $expansion.querySelector('img.set-logo-grid-item-symbol');
            if ($symbol) {
                $placeholder.innerHTML += `<img src="${$symbol.getAttribute('src')}" class="symbol" alt="Expansion Symbol"/>`;
            }

            $printWrapper.appendChild($placeholder.cloneNode(true));
            $printWrapper.appendChild($placeholder.cloneNode(true));

            // Grid items that survived the re-render already have their checkbox.
            if ($expansion.querySelector(':scope > label')) {
                return;
            }

            // Add a checkbox to select the expansion in print-selection-mode.
            const $checkbox = document.createElement('input');
            $checkbox.setAttribute('type', 'checkbox');
            $checkbox.setAttribute('data-expansion-id', expansionId);
            $checkbox.addEventListener('click', () => {
                this.updateSelectionCount();
            })

            const $checkboxLabel = document.createElement('label');
            $checkboxLabel.appendChild($checkbox);
            $expansion.appendChild($checkboxLabel);
        });

        this.updateSelectionCount();
    }

    observeSearchResults = () => {
        const $pageContent = document.querySelector('#page-content');
        if (!$pageContent) {
            return;
        }

        const observerOptions = {childList: true, subtree: true};

        this.observer = new MutationObserver(() => {
            if (this.isSyncScheduled) {
                return;
            }
            this.isSyncScheduled = true;

            requestAnimationFrame(() => {
                this.isSyncScheduled = false;
                this.observer.disconnect();
                this.syncSelectableSets();
                this.observer.observe($pageContent, observerOptions);
            });
        });

        this.observer.observe($pageContent, observerOptions);
    }

    setUpPrintNavigation = () => {
        if (this.isPrintNavigationSetUp) {
            return;
        }
        this.isPrintNavigationSetUp = true;

        const $body = document.body;

        const $printNavigation = document.createElement('div');
        $printNavigation.classList.add(...['print-navigation']);
        const $inner = document.createElement('div');
        $inner.classList.add(...['inner']);
        $printNavigation.appendChild($inner);
        $body.appendChild($printNavigation);

        const $cancelPrintSelectionModeButton = document.createElement('button');
        $cancelPrintSelectionModeButton.classList.add(...['cancel']);
        $cancelPrintSelectionModeButton.innerHTML = `${icon('ban')}<div>Exit print mode</div>`;
        $cancelPrintSelectionModeButton.addEventListener('click', () => {
            $body.classList.remove('in-print-selection-mode');
        });

        const $printButton = document.createElement('button');
        $printButton.classList.add(...['print']);
        $printButton.innerHTML = `${icon('print')}<div>Print <span class="count">0</span> set logo(s)</div>`;
        $printButton.addEventListener('click', () => {
            const size = parseInt(document.querySelector('.size input').value);
            const shape = document.querySelector('.shape select').value;

            const pageBreakAfterElementCount = Math.floor(210 / (size + 2.5)) * Math.floor(297 / (size + 2.5));

            document.querySelectorAll(`div.expansion[data-expansion-id]`).forEach($placeholder => {
                $placeholder.style.display = 'none';
                $placeholder.style.setProperty('--expansion-width', `${size}mm`);
                $placeholder.style.setProperty('--expansion-border-radius', shape);
                $placeholder.classList.remove(...['page-break']);
            });

            let count = 0;
            document.querySelectorAll('input[type="checkbox"][data-expansion-id]:checked').forEach($checkbox => {
                const expansionId = $checkbox.getAttribute('data-expansion-id');
                document.querySelectorAll(`div.expansion[data-expansion-id="${expansionId}"]`).forEach($placeholder => {
                    $placeholder.style.display = null;
                    count++;
                    if (count % pageBreakAfterElementCount === 0) {
                        $placeholder.classList.add(...['page-break']);
                    }
                });
            });

            $body.classList.add('printing');
            window.print();
        });

        const $shapeSelect = document.createElement('div');
        $shapeSelect.classList.add(...['shape']);
        $shapeSelect.innerHTML = `${icon('swatchbook')}
            <select>
            <option value="50%" selected>Circle</option>
            <option value="0">Rectangle</option>
            </select>`;

        const $sizeInput = document.createElement('div');
        $sizeInput.classList.add(...['size']);
        $sizeInput.innerHTML = `${icon('resize')}<input type="number" min="1" max="99" value="39"/><span class="unit">mm</span>`;

        $inner.appendChild($shapeSelect);
        $inner.appendChild($sizeInput);
        $inner.appendChild($printButton);
        $inner.appendChild($cancelPrintSelectionModeButton);


        const $togglePrintSelectionModeButton = document.createElement('button');
        $togglePrintSelectionModeButton.classList.add(...['button', 'button-plain-alt', 'toggle-print-selection']);
        $togglePrintSelectionModeButton.setAttribute('title', 'Print set logos');
        $togglePrintSelectionModeButton.innerHTML = `${icon('print')}<div>Print set logos</div>`;
        $togglePrintSelectionModeButton.addEventListener('click', () => {
            $body.classList.add('in-print-selection-mode');
        });

        document.querySelector('#sets-side-buttons').appendChild($togglePrintSelectionModeButton);

        addEventListener("afterprint", () => {
            $body.classList.remove('printing');
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                $body.classList.remove('in-print-selection-mode');
            }
        });
    }

    apply = async () => {
        this.setUpPrintNavigation();
        this.syncSelectableSets();
        this.observeSearchResults();
    }
}
