<template>
    <div class="container">
        <span class="price-item-invalid pr-3" v-if="!isComponentAvailable()">
            ${{ getPrice() }} {{ getItemPriceText }}
        </span>
        <span class="price-item pr-3" v-else>${{ getPrice() }} {{ getItemPriceText }}</span>
        <span class="price-all pr-3">${{ getAllPricing() }} {{ getAllPriceText }}</span>
        <div class="money pl-4 pb-2 green--text text--lighten-1">${{ money.toFixed(2).toLocaleString() }}</div>
        <!-- Pop Up for Purchase -->
        <Modal v-if="showDialog">
            <Frame minWidth="30vw" maxWidth="30vw">
                <template v-slot:toolbar>
                    <Toolbar :hideExit="true">
                        <span class="green--text">{{ getLocaleText('LABEL_INSTRUCTION_HEADER') }}</span>
                    </Toolbar>
                </template>
            </Frame>
        </Modal>
        <!-- Right Panel -->
        <div class="creator stack">
            <!-- Navigation -->
            <Navigation
                v-bind:page-index="pageIndex"
                v-bind:pages="pages"
                v-bind:page-name="pageName"
                @next="nextPage"
                @prev="prevPage"
            />
            <!-- Customization -->
            <template v-if="page">
                <Option v-bind:page="page" @force-populate="forcePopulate" @update-component="updateComponent" />
            </template>

            <!-- Purchase Options -->
            <div class="footer pa-4" v-if="page">
                <div class="split split-full space-between">
                    <template v-if="isComponentAvailable() && hasEnoughMoney()">
                        <Button
                            class="smooth-button fill-full-width mr-3"
                            color="green"
                            @click="purchaseComponent()"
                        >
                            <span class="green--text">{{ getPurchaseText }}</span>
                        </Button>
                    </template>
                    <template v-else>
                        <Button class="smooth-button fill-full-width mr-3" color="grey" :disable="true">
                            <span class="grey--text">{{ getPurchaseText }}</span>
                        </Button>
                    </template>
                    <template v-if="isComponentAvailableAll() && hasEnoughMoneyAll()">
                        <Button class="smooth-button fill-full-width mr-3" color="green" @click="purchaseAll">
                            <span class="green--text">{{ getPurchaseAllText }}</span>
                        </Button>
                    </template>
                    <template v-else>
                        <Button class="smooth-button fill-full-width mr-3" color="grey" :disable="true">
                            <span class="grey--text">{{ getPurchaseAllText }}</span>
                        </Button>
                    </template>
                    <Button class="smooth-button fill-full-width mr-3" color="grey" @click="handleClose">
                        <span class="red--text">{{ getExitText }}</span>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import WebViewEvents from '@ViewUtility/webViewEvents';
import { CLOTHING_INTERACTIONS } from '../shared/events';
import { defineComponent, defineAsyncComponent } from 'vue';
import { EXAMPLE_CLOTHING_DATA } from './utility/exampleData';
import { DEFAULT_CLOTHING_STORE } from './utility/defaultData';
import { LOCALE_CLOTHING } from '../shared/locales';
import { IClothingStorePage } from '../shared/interfaces';

const ComponentName = 'Clothing';
export default defineComponent({
    name: ComponentName,
    props: {
        emit: Function,
    },
    components: {
        Button: defineAsyncComponent(() => import('@components/Button.vue')),
        Frame: defineAsyncComponent(() => import('@components/Frame.vue')),
        Icon: defineAsyncComponent(() => import('@components/Icon.vue')),
        Input: defineAsyncComponent(() => import('@components/Input.vue')),
        Modal: defineAsyncComponent(() => import('@components/Modal.vue')),
        RangeInput: defineAsyncComponent(() => import('@components/RangeInput.vue')),
        Toolbar: defineAsyncComponent(() => import('@components/Toolbar.vue')),
        Option: defineAsyncComponent(() => import('./components/Option.vue')),
        Navigation: defineAsyncComponent(() => import('./components/Navigation.vue')),
    },
    data() {
        return {
            // New stuff
            pageIndex: 0,
            pageName: '',
            money: 0,
            page: {},
            pages: [] as Array<IClothingStorePage>,
            // Old dog shit
            showDialog: false,
            labels: [],
            allValid: false,
            validity: {
                name: false,
                desc: false,
            },
            storeData: DEFAULT_CLOTHING_STORE,
        };
    },
    computed: {
        getLabels() {
            return this.pages[this.pageIndex];
        },
        getIDs() {
            return this.pages[this.pageIndex].ids;
        },
        getPurchaseText() {
            return LOCALE_CLOTHING.LABEL_PURCHASE;
        },
        getPurchaseAllText() {
            return LOCALE_CLOTHING.LABEL_PURCHASE_ALL;
        },
        getExitText() {
            return LOCALE_CLOTHING.LABEL_EXIT;
        },
        getAllPriceText() {
            return LOCALE_CLOTHING.LABEL_ALL_PRICE;
        },
        getItemPriceText() {
            return LOCALE_CLOTHING.LABEL_ITEM;
        },
    },
    methods: {
        getLocaleText(key: string) {
            if (!LOCALE_CLOTHING[key]) {
                return `${key} is not a valid locale`;
            }

            return LOCALE_CLOTHING[key];
        },
        nextPage() {
            if (this.pageIndex + 1 >= this.pages.length) {
                this.pageIndex = 0;
            } else {
                this.pageIndex += 1;
            }

            this.setPage(this.pageIndex);
        },
        prevPage() {
            if (this.pageIndex - 1 <= -1) {
                this.pageIndex = this.pages.length - 1;
            } else {
                this.pageIndex -= 1;
            }

            this.setPage(this.pageIndex);
        },
        setPage(index: number) {
            this.pageName = this.pages[index].pageName;
            this.page = this.pages[index];
            this.sendPageUpdate();
        },
        setBankData(money: number) {
            this.money = money;
        },
        forcePopulate() {
            if (!('alt' in window)) {
                return;
            }

            WebViewEvents.emitClient(CLOTHING_INTERACTIONS.POPULATE, JSON.stringify(this.pages));
        },
        updateComponent(index: number, dataName: string, value: number, isIncrement = false) {
            const pages = [...this.pages];
            let shouldPopulate = false;

            // This will always set the texture back to zero if the drawable id changes.
            if (dataName === 'drawables') {
                pages[this.pageIndex].textures[index] = 0;
                shouldPopulate = true;
            }

            // Determine how we update this data.
            if (isIncrement) {
                pages[this.pageIndex][dataName][index] += value;
            } else {
                // is A Range Input
                pages[this.pageIndex][dataName][index] = value;
                shouldPopulate = false;
            }

            // This ensures min and max values are not exceeded.
            const maxValue =
                dataName === 'drawables'
                    ? pages[this.pageIndex].maxDrawables[index]
                    : pages[this.pageIndex].maxTextures[index];

            if (pages[this.pageIndex][dataName][index] > maxValue) {
                pages[this.pageIndex][dataName][index] = 0;
            }

            let minValue = 0;

            if (pages[this.pageIndex].isProp) {
                minValue = -1;
            }

            if (pages[this.pageIndex][dataName][index] < minValue) {
                pages[this.pageIndex][dataName][index] = maxValue;
            }

            this.pages = pages;
            this.page = this.page;

            if (!('alt' in window)) {
                return;
            }

            // Determine if we should update the labels / components based on what changed.
            WebViewEvents.emitClient(CLOTHING_INTERACTIONS.UPDATE, JSON.stringify(this.pages), false, shouldPopulate);
        },
        async setPages(pages: Array<IClothingStorePage>) {
            this.pages = pages;
            this.page = this.pages[this.pageIndex];
        },
        hasEnoughMoney() {
            const price = this.getPrice();
            if (price <= 0) {
                return false;
            }

            if (this.money >= price) {
                return true;
            }

            return false;
        },
        hasEnoughMoneyAll() {
            const price = this.getAllPricing();
            if (price <= 0) {
                return false;
            }

            if (this.money >= price) {
                return true;
            }

            return false;
        },
        getPrice() {
            if (!this.pages[this.pageIndex]) {
                return 0;
            }

            const label = this.pages[this.pageIndex];
            const internalID = label.internalID;

            if (this.pages[this.pageIndex].startValue === this.pages[this.pageIndex].drawables[0]) {
                return 0;
            }

            if (this.storeData.clothingPrices[internalID]) {
                const currentComponent = label.drawables[0];
                const priceInfo = this.storeData.clothingPrices[internalID].find((x) => x.id === currentComponent);

                if (priceInfo) {
                    return priceInfo.price;
                }
            }

            return this.storeData.pagePrices[internalID] ? this.storeData.pagePrices[internalID] : 0;
        },
        getAllPricing() {
            if (!this.pages || this.pages.length <= 0) {
                return -1;
            }

            let price = 0;

            for (let i = 0; i < this.pages.length; i++) {
                const page = this.pages[i];
                const id = page.internalID;

                if (page.startValue === 'undefined' || page.startValue === null) {
                    continue;
                }

                if (page.drawables[0] === page.startValue) {
                    continue;
                }

                if (page.isProp && page.drawables[0] === -1) {
                    continue;
                }

                if (this.storeData.clothingPrices[id]) {
                    const currentComponent = page.drawables[0];
                    const priceInfo = this.storeData.clothingPrices[id].find((x) => x.id === currentComponent);

                    if (priceInfo) {
                        price += priceInfo.price;
                        continue;
                    }
                }

                price += this.storeData.pagePrices[id] ? this.storeData.pagePrices[id] : 0;
            }

            return price;
        },        
        purchaseComponent() {
            const pageData = JSON.parse(JSON.stringify(this.pages[this.pageIndex]));
            delete pageData.startValue;
            delete pageData.maxDrawables;
            delete pageData.maxTextures;
            delete pageData.name;
            delete pageData.pageName;
            delete pageData.names;

            WebViewEvents.emitClient(
                CLOTHING_INTERACTIONS.PURCHASE,
                this.storeData.uid,
                [pageData],
            );
        },
        purchaseAll() {
            if (!this.pages || this.pages.length <= 0) {
                return;
            }

            const pages: Array<IClothingStorePage> = [];

            for (let i = 0; i < this.pages.length; i++) {
                const pageData = JSON.parse(JSON.stringify(this.pages[i]));

                if (pageData.startValue === 'undefined' || pageData.startValue === null) {
                    continue;
                }

                if (pageData.drawables[0] === pageData.startValue) {
                    continue;
                }

                if (pageData.isProp && pageData.drawables[0] === -1) {
                    continue;
                }

                delete pageData.startValue;
                delete pageData.maxDrawables;
                delete pageData.maxTextures;
                delete pageData.name;
                delete pageData.pageName;
                delete pageData.names;
                pages.push(pageData);
            }

            WebViewEvents.emitClient(CLOTHING_INTERACTIONS.PURCHASE, this.storeData.uid, pages);
        },
        isComponentAvailableAll() {
            let allAvailable = true;

            if (!this.pages || this.pages.length <= 0) {
                return allAvailable;
            }

            for (let i = 0; i < this.pages.length; i++) {
                const page = this.pages[i];

                for (let y = 0; y < page.ids.length; y++) {
                    // This is the ID of the component.
                    // ie. A mask ID is 1
                    const internalID = page.internalID;
                    const hiddenComponents: Array<number> = this.storeData.hiddenComponents[internalID];

                    // No internal component info found. Everything is available.
                    if (!hiddenComponents) {
                        break;
                    }

                    const currentValue = page.drawables[y];
                    const index = hiddenComponents.findIndex((id) => id === currentValue);

                    if (index <= -1) {
                        continue;
                    }

                    allAvailable = false;
                    break;
                }
            }

            return allAvailable;
        },
        isComponentAvailable() {
            let allAvailable = true;

            if (!this.pages[this.pageIndex]) {
                return allAvailable;
            }

            if (this.pages[this.pageIndex].isProp && this.pages[this.pageIndex].drawables[0] === -1) {
                return false;
            }

            if (this.pages[this.pageIndex].startValue === this.pages[this.pageIndex].drawables[0]) {
                return false;
            }

            // Need to loop through all ids.
            for (let i = 0; i < this.pages[this.pageIndex].ids.length; i++) {
                // This is the ID of the component.
                // ie. A mask ID is 1
                const internalID = this.pages[this.pageIndex].internalID;
                const hiddenComponents: Array<number> = this.storeData.hiddenComponents[internalID];

                // No internal component info found. Everything is available.
                if (!hiddenComponents) {
                    break;
                }

                const currentValue = this.pages[this.pageIndex].drawables[i];
                const index = hiddenComponents.findIndex((id) => id === currentValue);

                if (index <= -1) {
                    continue;
                }

                allAvailable = false;
                break;
            }

            return allAvailable;
        },
        inputChange(prop: string, value: string) {
            this[prop] = value;
        },
        setValidityProp(propName: string, result: boolean) {
            this.validity[propName] = result;

            let allValid = true;
            Object.keys(this.validity).forEach((key) => {
                if (!this.validity[key]) {
                    allValid = false;
                    return;
                }
            });

            this.allValid = allValid;
        },
        getData(dataName: string, index: number) {
            return this.pages[this.pageIndex][dataName][index];
        },
        sendPageUpdate() {
            if (!('alt' in window)) {
                return;
            }

            WebViewEvents.emitClient(CLOTHING_INTERACTIONS.PAGE_UPDATE, this.pageIndex);
        },
        handlePress(e) {
            if (e.keyCode !== 27) {
                return;
            }

            this.handleClose();
        },
        handleClose() {
            if (!('alt' in window)) {
                return;
            }

            WebViewEvents.emitClose();
        },
        setData(data) {
            this.storeData = data;

            const pagesToRemove = [...this.storeData.hiddenPages];
            const currentLabels = [...this.labels];

            // Loop through this backwards so it does not screw up the order
            // of the labels.
            for (let i = currentLabels.length - 1; i >= 0; i--) {
                const pageIndex = pagesToRemove.findIndex((id) => id === i);
                if (pageIndex <= -1) {
                    continue;
                }

                currentLabels.splice(i, 1);
            }

            this.labels = currentLabels;
        },
    },
    mounted() {
        document.addEventListener('keyup', this.handlePress);

        // Set Default Example Data
        this.pages = EXAMPLE_CLOTHING_DATA;
        this.setPage(this.pageIndex);

        if ('alt' in window) {
            WebViewEvents.on(CLOTHING_INTERACTIONS.SET_DATA, this.setData);
            WebViewEvents.on(CLOTHING_INTERACTIONS.PROPAGATE, this.setPages);
            WebViewEvents.on(CLOTHING_INTERACTIONS.SET_BANK_DATA, this.setBankData);
            WebViewEvents.emitReady(ComponentName);

            setTimeout(() => {
                WebViewEvents.emitClient(CLOTHING_INTERACTIONS.POPULATE, JSON.stringify(this.pages));
            }, 200);
        } else {
            this.money = 500000;
        }
    },
    unmounted() {
        document.removeEventListener('keyup', this.handlePress);
    },
});
</script>

<style scoped>
/* This style is applied to only this page */
.container {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(to left, rgba(0, 0, 0, 1), transparent 35%);
}

.price-item {
    position: fixed;
    top: 48px;
    right: 402px;
    z-index: 99;
    text-shadow: 2px 2px 2px black;
    font-size: 16px !important;
}

.price-item-invalid {
    position: fixed;
    top: 48px;
    right: 402px;
    z-index: 99;
    text-shadow: 2px 2px 2px black;
    font-size: 16px !important;
    color: rgba(200, 50, 50, 1);
}

.price-all {
    position: fixed;
    top: 6px;
    right: 400px;
    z-index: 99;
    text-shadow: 2px 2px 2px black;
    font-size: 32px !important;
}

.creator {
    position: fixed;
    min-width: 400px;
    max-width: 400px;
    min-height: 100vh;
    max-height: 100vh;
    background: rgba(12, 12, 12, 1) !important;
    right: 0;
    border-left: 2px solid rgba(64, 64, 64, 1);
}

.navigation {
    min-height: 100px;
    max-height: 100px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.split {
    box-sizing: border-box;
}

.escape {
    top: 2vh;
    left: 2vw;
}

.footer {
    display: flex;
    flex-direction: column;
    min-height: auto;
    max-height: auto;
    box-sizing: border-box;
    width: 100%;
}

.price {
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    text-align: left;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
}

.money {
    position: fixed;
    bottom: 0px;
    left: 0px;
    font-family: 'Roboto';
    font-size: 26px;
    font-weight: 600;
    text-shadow: 1px 1px black;
    z-index: 99;
}

.footer {
    background: url('../../../../../src-webviews/public/assets/images/bg.png');
}

.smooth-button {
    border-radius: 6px;
}
</style>
