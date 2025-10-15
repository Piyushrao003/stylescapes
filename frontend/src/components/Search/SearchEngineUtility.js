/**
 * SearchEngineUtility
 * A pure JavaScript utility class for normalizing queries and performing
 * multi-tiered, keyword-based search matching against cached product data.
 */
class SearchEngineUtility {
    constructor() {
        // --- 1. EXPANDED CATEGORY MAPPINGS (Based on user-provided styles and Indian aliases) ---
        this.categoryMappings = {
            // Summer/Monsoon Priority
            tshirts: {
                keywords: [
                    'tshirt', 't-shirt', 'tee', 'round neck', 'v-neck', 'crew neck', 'polo', 
                    'coller t shirts', 'oversize t shirts', 'back print t shirts', 
                    'full sleeve t shirts', 'off shoulder t shirts', 'baggy t shirts',
                    'ganji' // Local Alias
                ],
                aliases: ['t-shirts', 'teeshirts', 'tees'],
                display: 'T-Shirts',
                season: 'summer'
            },
            shirts: {
                keywords: [
                    'shirt', 'check shirt', 'casual shirt', 'formal shirts', 'baggy shirts',
                    'printed shirts', 'funky shirts', 'dress shirt', 'button up', 'button-up',
                    'blouse', 'camicia' // Local Alias
                ],
                aliases: ['shirts', 'dress-shirt'],
                display: 'Shirts',
                season: 'summer'
            },
            shorts: {
                keywords: ['shorts', 'half pant', 'bermuda', 'swimming trunks'],
                aliases: ['short', 'nikkar'], // Local Alias
                display: 'Shorts',
                season: 'summer'
            },
            
            // Winter/Cold Priority
            winter: {
                keywords: [
                    'jacket', 'hoodie', 'hoody', 'sweatshirt', 'sweater', 'pullover', 
                    'cardigan', 'coat', 'blazer', 'winter wear', 'koti' // Local Alias
                ],
                aliases: ['jackets', 'coats', 'hoodies'],
                display: 'Winter Wear',
                season: 'winter'
            },

            // All-Season Priority
            jeans: {
                keywords: [
                    'jeans', 'denim', 'slim fit', 'regular fit', 'relaxed fit', 
                    'straight jeans', 'bootcut jeans', 'baggy jeans', 'denim pant'
                ],
                aliases: ['jean', 'denims'],
                display: 'Jeans',
                season: 'all'
            },
            lower: {
                keywords: [
                    'lower', 'trousers', 'pant', 'straight fit', 'narrow fit', 
                    'joggers', 'payjama', 'pyjama', 'track pant' // Local Aliases
                ],
                aliases: ['pants', 'bottoms'],
                display: 'Lowers / Trousers',
                season: 'all'
            }
        };

        // --- 2. QUICK FILTER MAPPINGS ---
        this.quickFilterMappings = {
            all: ['tshirts', 'shirts', 'jeans', 'lower', 'winter', 'shorts'],
            casual: ['tshirts', 'lower', 'shorts'],
            formal: ['shirts', 'lower'], // Formal shirts + formal trousers
            sportswear: ['tshirts', 'lower', 'shorts'],
            winter_collection: ['winter', 'tshirts', 'jeans']
        };
    }

    /**
     * @description Normalizes the input query for accurate matching.
     * @param {string} query
     * @returns {string} Normalized string.
     */
    normalizeQuery(query) {
        if (!query) return '';
        return query
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ');   // Collapse multiple spaces
    }

    /**
     * @description Checks if a normalized query string matches any keywords or aliases
     * of a given category.
     * @param {string} normalizedQuery - Query after normalization.
     * @param {string} categoryKey - The key of the category (e.g., 'tshirts').
     * @returns {boolean}
     */
    matchesCategoryKeywords(normalizedQuery, categoryKey) {
        const categoryData = this.categoryMappings[categoryKey];
        
        if (!categoryData) return false;

        const allTerms = [
            categoryKey.replace('-', ' '),
            ...categoryData.aliases,
            ...categoryData.keywords
        ].map(term => this.normalizeQuery(term));

        return allTerms.some(term => 
            normalizedQuery.includes(term) || term.includes(normalizedQuery)
        );
    }

    /**
     * @description Performs a multi-tiered search filter on an array of product data.
     * @param {string} query - The raw search input.
     * @param {Array<object>} productList - The array of all products (JSON data).
     * @returns {Array<object>} Filtered list of products.
     */
    search(query, productList) {
        if (!query || query.trim() === '') {
            return productList;
        }

        const normalizedQuery = this.normalizeQuery(query);
        
        return productList.filter(product => {
            const productName = this.normalizeQuery(product.product_name || '');
            const productCategory = product.category || '';
            const productStyle = product.style || '';
            
            // Tier 1: Exact/Direct Match (Name/SKU)
            if (productName.includes(normalizedQuery) || 
                (product.sku && this.normalizeQuery(product.sku).includes(normalizedQuery))) {
                return true;
            }

            // Tier 2: Localized Alias / Style Match (High Confidence)
            // Checks if the query matches the product's primary category or style keywords
            if (this.matchesCategoryKeywords(normalizedQuery, productCategory)) {
                return true;
            }
            if (this.matchesCategoryKeywords(normalizedQuery, productStyle)) {
                 return true;
            }

            // Tier 3: Broad Category Check (Checking all available categories)
            const matchesBroadCategory = Object.keys(this.categoryMappings).some(key => 
                this.matchesCategoryKeywords(normalizedQuery, key)
            );
            
            if (matchesBroadCategory) {
                 // If the query matches a broad category (e.g., 'jeans'), include products from that category.
                 return this.normalizeQuery(productCategory).includes(normalizedQuery);
            }

            return false;
        });
    }
}

// Factory function to be used in SearchPage.jsx
export const searchEngineUtility = new SearchEngineUtility();
