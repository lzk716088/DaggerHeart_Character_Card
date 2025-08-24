/**
 * 显示一个包含可筛选、可排序数据的模态弹窗。
 * 首次调用时，会自动加载所需的 HTML 和 CSS。
 * @param {Array<Object>} data - 要在表格中显示的数据数组。
 * @param {Object} [config={}] - 用于自定义表格行为的配置对象。
 * @param {Object} [config.columnMap={}] - 列键到显示名稱的映射。
 * @param {string[]} [config.filterableColumns=[]] - 需要添加筛选功能的列的键数组。
 * @param {string} [config.storageKey] - 用于在 localStorage 中保存筛选状态的唯一键。
 * @param {string} [config.title] - 模态框的标题。
 */
function showDataTableModal(data, onRowSelected, config = {}) {
    console.log("Opening data table modal with config:", config);
    return new Promise((resolve, reject) => {
        // 1. 获取 DOM 元素引用
        const modal = document.getElementById('data-table-modal');
        const closeButton = document.getElementById('data-table-modal-close');
        const titleElement = document.getElementById('data-table-modal-title');
        const fixedHeader = document.getElementById('data-table-fixed-header');
        const bodyContainer = document.getElementById('data-table-body-container');

        if (!modal || !closeButton || !titleElement || !fixedHeader || !bodyContainer) {
            console.error('One or more modal elements could not be found in the DOM.');
            reject('Modal elements not found.');
            return;
        }

        fixedHeader.innerHTML = '';
        bodyContainer.innerHTML = '';

        if (!data || data.length === 0) {
            console.warn('showDataTableModal called with invalid or empty data.');
            reject('No data provided.');
            return;
        }

        const { columnMap = {}, filterableColumns = [], storageKey, columnWidths = {}, hiddenColumns = [], preselectedFilters = {} } = config;
        const keys = Object.keys(data[0]).filter(key => !hiddenColumns.includes(key));

        const headerTable = document.createElement('table');
        const thead = document.createElement('thead');
        const titleRow = document.createElement('tr');
        const filterRow = document.createElement('tr');
        const filterSelects = [];

        // 3. 动态生成表头和筛选器
        keys.forEach(key => {
            // Title Row
            const titleTh = document.createElement('th');
            if (columnWidths[key]) {
                titleTh.style.width = columnWidths[key];
            }
            titleTh.textContent = columnMap[key] || key;
            titleRow.appendChild(titleTh);

            // Filter Row
            const filterTh = document.createElement('th');
            if (filterableColumns.includes(key)) {
                const select = document.createElement('select');
                select.dataset.key = key;
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '全部';
                select.appendChild(defaultOption);

                const uniqueValues = [...new Set(data.map(item => item[key]))].sort();
                uniqueValues.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });

                if (preselectedFilters[key]) {
                    select.value = preselectedFilters[key];
                }

                filterTh.appendChild(select);
                filterSelects.push(select);
            }
            filterRow.appendChild(filterTh);
        });

        thead.appendChild(titleRow);
        thead.appendChild(filterRow);
        headerTable.appendChild(thead);
        fixedHeader.appendChild(headerTable);

        const bodyTable = document.createElement('table');
        const colgroup = document.createElement('colgroup');
        keys.forEach(key => {
            const col = document.createElement('col');
            if (columnWidths[key]) {
                col.style.width = columnWidths[key];
            }
            colgroup.appendChild(col);
        });
        bodyTable.appendChild(colgroup);
        const tbody = document.createElement('tbody');
        bodyTable.appendChild(tbody);
        bodyContainer.appendChild(bodyTable);

        // 4. 核心功能函数
        const renderTableBody = (filteredData) => {
            tbody.innerHTML = '';
            filteredData.forEach(item => {
                const tr = document.createElement('tr');
                tr.dataset.rowData = JSON.stringify(item);
                keys.forEach(key => {
                    const td = document.createElement('td');
                    td.textContent = removeMarkdownFormatting(item[key]);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        };

        const applyFiltersAndRender = () => {
            const currentFilters = {};
            filterSelects.forEach(select => {
                currentFilters[select.dataset.key] = select.value;
            });

            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify(currentFilters));
            }

            const filteredData = data.filter(item => {
                return Object.entries(currentFilters).every(([key, value]) => {
                    return !value || String(item[key]) === value;
                });
            });

            renderTableBody(filteredData);

            // Adjust header padding to account for scrollbar
            const scrollbarWidth = bodyContainer.offsetWidth - bodyContainer.clientWidth;
            fixedHeader.style.paddingRight = `${scrollbarWidth}px`;
        };

        // 5. 状态持久化和事件绑定
        if (storageKey && !Object.keys(preselectedFilters).length) {
            const savedState = localStorage.getItem(storageKey);
            if (savedState) {
                const filters = JSON.parse(savedState);
                filterSelects.forEach(select => {
                    if (filters[select.dataset.key]) {
                        select.value = filters[select.dataset.key];
                    }
                });
            }
        }

        filterSelects.forEach(select => {
            select.addEventListener('change', applyFiltersAndRender);
        });

        // 6. 实现行點击選擇
        const handleRowClick = (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.rowData) {
                const selectedData = JSON.parse(row.dataset.rowData);
                if (typeof onRowSelected === 'function') {
                    onRowSelected(selectedData);
                }
                resolve(selectedData);
                cleanupAndClose();
            }
        };
        bodyContainer.addEventListener('click', handleRowClick);

        // 7. 实现显示/隐藏和关闭逻辑
        modal.style.display = 'block';
        const cleanupAndClose = () => {
            modal.style.display = 'none';
            closeButton.removeEventListener('click', handleCloseClick);
            window.removeEventListener('click', handleWindowClick);
            bodyContainer.removeEventListener('click', handleRowClick);
            filterSelects.forEach(select => select.removeEventListener('change', applyFiltersAndRender));
        };

        const handleCloseClick = () => {
            reject('使用者關閉了視窗');
            cleanupAndClose();
        };

        const handleWindowClick = (event) => {
            if (event.target === modal) {
                reject('使用者關閉了視窗');
                cleanupAndClose();
            }
        };

        closeButton.addEventListener('click', handleCloseClick);
        window.addEventListener('click', handleWindowClick);

        if (config.title) {
            titleElement.innerHTML = config.title;
        }

        // 初始加载
        applyFiltersAndRender();
    });
}

function setupDataModalButtons() {
    // Helper function to update checkbox visuals based on state, avoiding dependency on TriStateCheckbox class instance
    const updateCheckboxVisualState = (element) => {
        if (!element) return;
        const state = element.dataset.state;
        element.classList.remove('state-checked', 'state-dashed');
        if (state === '1') {
            element.classList.add('state-checked');
        } else if (state === '2') {
            element.classList.add('state-dashed');
        }
    };

    // Helper function to set up a weapon button
    const setupWeaponButton = (buttonId, dataSource, modalTitle, storageKey, nameId, statId, damageId, traitId, columnWidths) => {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.addEventListener('click', () => {
            if (typeof dataSource === 'undefined') {
                console.error(`Data source for ${modalTitle} is not defined.`);
                alert(`錯誤：${modalTitle}數據源未定義。`);
                return;
            }

            const modalConfig = {
                title: modalTitle,
                hiddenColumns: ["類型"],
                filterableColumns: ["屬性", "距離", "雙手", "傷害型別", "位階"],
                storageKey: storageKey,
                columnWidths: columnWidths
            };

            showDataTableModal(dataSource, (selectedItem) => {
                const targetMap = {
                    "名稱": nameId,
                    "描述": traitId
                };
                for (const sourceKey in targetMap) {
                    const targetElement = document.getElementById(targetMap[sourceKey]);
                    if (targetElement) {
                        targetElement.value = removeMarkdownFormatting(selectedItem[sourceKey] || '');
                    }
                }

                // Composite for Stat
                const compositeStatTarget = {
                    targetId: statId,
                    format: "{屬性}／{距離}"
                };
                const compositeStatElement = document.getElementById(compositeStatTarget.targetId);
                if (compositeStatElement) {
                    let formattedString = compositeStatTarget.format;
                    const placeholders = formattedString.match(/{[^{}]+}/g) || [];
                    placeholders.forEach(placeholder => {
                        const key = placeholder.substring(1, placeholder.length - 1);
                        const value = selectedItem[key] || '';
                        formattedString = formattedString.replace(placeholder, value);
                    });
                    compositeStatElement.value = formattedString;
                }

                // Composite for Damage
                const compositeDamageTarget = {
                    targetId: damageId,
                    format: "{傷害}／{傷害類型}"
                };
                const compositeDamageElement = document.getElementById(compositeDamageTarget.targetId);
                if (compositeDamageElement) {
                    let formattedString = compositeDamageTarget.format;
                    const placeholders = formattedString.match(/{[^{}]+}/g) || [];
                    placeholders.forEach(placeholder => {
                        const key = placeholder.substring(1, placeholder.length - 1);
                        const value = selectedItem[key] || '';
                        formattedString = formattedString.replace(placeholder, value);
                    });
                    compositeDamageElement.value = formattedString;
                }
            }, modalConfig);
        });
    };

    const weaponWidths = { 名稱: '10%', 傷害: '5%', 屬性: '5%', 距離: '7%', 雙手: '5%', 傷害類型: '5%', 位階: '5%' };

    // Primary Weapon
    setupWeaponButton(
        'add-primary-weapon-btn',
        typeof PRIMARY_WEAPON !== 'undefined' ? PRIMARY_WEAPON : undefined,
        "選擇主武器",
        "primaryWeaponFilterState",
        "PrimaryWeaponNameTextbox",
        "PrimaryWeaponStatTextbox",
        "PrimaryWeaponDamageTextbox",
        "PrimaryWeaponTraitTextbox",
        weaponWidths
    );

    // Secondary Weapon
    setupWeaponButton(
        'add-secondary-weapon-btn',
        typeof SECONDARY_WEAPON !== 'undefined' ? SECONDARY_WEAPON : undefined,
        "選擇副武器",
        "secondaryWeaponFilterState",
        "SecondaryWeaponNameTextbox",
        "SecondaryWeaponStatTextbox",
        "SecondaryWeaponDamageTextbox",
        "SecondaryWeaponTraitTextbox",
        weaponWidths
    );
    
    // Backup Weapon 1
    setupWeaponButton(
        'add-backup1-weapon-btn',
        (typeof PRIMARY_WEAPON !== 'undefined' && typeof SECONDARY_WEAPON !== 'undefined') ? [...PRIMARY_WEAPON, ...SECONDARY_WEAPON] : undefined,
        "選擇備用武器1",
        "backup1WeaponFilterState",
        "Backup1WeaponNameTextbox",
        "Backup1WeaponStatTextbox",
        "Backup1WeaponDamageTextbox",
        "Backup1WeaponTraitTextbox",
        weaponWidths
    );

    // Backup Weapon 2
    setupWeaponButton(
        'add-backup2-weapon-btn',
        (typeof PRIMARY_WEAPON !== 'undefined' && typeof SECONDARY_WEAPON !== 'undefined') ? [...PRIMARY_WEAPON, ...SECONDARY_WEAPON] : undefined,
        "選擇備用武器2",
        "backup2WeaponFilterState",
        "Backup2WeaponNameTextbox",
        "Backup2WeaponStatTextbox",
        "Backup2WeaponDamageTextbox",
        "Backup2WeaponTraitTextbox",
        weaponWidths
    );

    // Armor
    const addArmorBtn = document.getElementById('add-armor-btn');
    if (addArmorBtn) {
        addArmorBtn.addEventListener('click', () => {
            if (typeof ARMOR === 'undefined') {
                console.error('Data source variable "ARMOR" is not defined.');
                alert('錯誤：護甲資料來源未定義。');
                return;
            }

            const modalConfig = {
                title: "選擇護甲",
                hiddenColumns: ["類型"],
                filterableColumns: ["重傷閾值", "嚴重閾值", "護甲值", "位階"],
                storageKey: "armorFilterState",
                columnWidths: { 名稱: '10%', 重傷閾值: '5%', 嚴重閾值: '5%', 護甲值: '5%', 階: '5%' }
            };
            
            showDataTableModal(ARMOR, (selectedItem) => {
                // Retain existing logic for name and trait
                const directMap = {
                    "名稱": "ArmorNameTextbox",
                    "護甲值": "ArmorScoreTextbox",
                    "描述": "ArmorTraitTextbox"
                };
                for (const sourceKey in directMap) {
                    const targetElement = document.getElementById(directMap[sourceKey]);
                    if (targetElement) {
                        targetElement.value = removeMarkdownFormatting(selectedItem[sourceKey] || '');
                    }
                }

                const thresholdTarget = document.getElementById("ArmorThresholdTextbox");
                if (thresholdTarget) {
                    const major = selectedItem.重傷閾值 || '';
                    const severe = selectedItem.嚴重閾值 || '';
                    thresholdTarget.value = `${major}／${severe}`;
                }

                // New logic for thresholds and armor value
                const levelEl = document.getElementById('LevelTextbox');
                const level = parseInt(levelEl.value, 10) || 1;

                const majorThreshold = parseInt(selectedItem.重傷閾值, 10) || level;
                const severeThreshold = parseInt(selectedItem.嚴重閾值, 10) || (level*2);
                const armorValue = parseInt(selectedItem.护甲值, 10) || 0;

                const majorTextbox = document.getElementById('MajorTextbox');
                if (majorTextbox) {
                    majorTextbox.value = majorThreshold + level;
                }

                const severeTextbox = document.getElementById('SevereTextbox');
                if (severeTextbox) {
                    severeTextbox.value = severeThreshold + level;
                }

                const armorTextbox = document.getElementById('ArmorTextbox');
                if (armorTextbox) {
                    armorTextbox.value = armorValue;
                }

                // Update armor slots
                const armorSlots = document.querySelectorAll('#armor-slots-container .armor-slot-checkbox');
                armorSlots.forEach((slot, index) => {
                    if (index < armorValue) {
                        slot.dataset.state = '0'; // empty
                    } else {
                        slot.dataset.state = '2'; // dash
                    }
                    updateCheckboxVisualState(slot);
                });
            }, modalConfig);
        });
    }

    // Items
    const addItemBtn = document.getElementById('add-item-btn');
    const ITEMS = typeof LOOT_DATA !== 'undefined' ? LOOT_DATA : undefined;
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            if (typeof ITEMS === 'undefined') {
                console.error('Data source variable "ITEMS" is not defined.');
                alert('錯誤：物品資料來源未定義。');
                return;
            }

            const modalConfig = {
                title: "選擇物品",
                filterableColumns: ["型別"],
                storageKey: "itemFilterState",
                columnWidths: { 名稱: '15%', 類型: '5%', 擲骰: '5%' }
            };

            showDataTableModal(ITEMS, (selectedItem) => {
                const targetTextbox = document.getElementById('ItemSlot1Textbox');
                if (targetTextbox) {
                    const newItemText = `${selectedItem.名稱}: ${removeMarkdownFormatting(selectedItem.描述 || '')}`;
                    if (targetTextbox.value.trim() === '') {
                        targetTextbox.value = newItemText;
                    } else {
                        targetTextbox.value += `\n${newItemText}`;
                    }
                }
            }, modalConfig);
        });
    }
    
    // Domain Cards
    const addDomainCardBtn = document.getElementById('add-domain-card-btn');
    if (addDomainCardBtn) {
        addDomainCardBtn.addEventListener('click', () => {
            if (typeof DOMAIN_CARDS === 'undefined') {
                console.error('Data source variable "DOMAIN_CARDS" is not defined.');
                alert('錯誤：領域卡資料來源未定義。');
                return;
            }

            const classDomain = document.getElementById('ClassDomainTextbox')?.value;
            let modalTitle = "選擇領域卡";
            if (classDomain) {
                modalTitle = `選擇領域卡 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 當前職業領域：${classDomain}`;
            }

            const modalConfig = {
                title: modalTitle,
                hiddenColumns: ["類型"],
                filterableColumns: ["領域", "等級", "屬性", "回想"],
                storageKey: "domainCardFilterState",
                columnWidths: { 名稱: '10%', 領域: '5%', 等級: '5%', 屬性: '5%', 回想: '5%'}
            };

            showDataTableModal(DOMAIN_CARDS, (selectedItem) => {
                createCard(selectedItem);
            }, modalConfig);
        });
    }

    // Ancestry Cards
    const addAncestryCardBtn = document.getElementById('add-ancestry-card-btn');
    if (addAncestryCardBtn) {
        addAncestryCardBtn.addEventListener('click', async () => { // Make the event listener async
            if (typeof RACES_DATA === 'undefined') {
                console.error('Data source variable "RACES_DATA" is not defined.');
                alert('錯誤：種族資料來源未定義。');
                return;
            }

            const modalConfig = {
                title: "選擇第一個種族",
                hiddenColumns: ["簡介", "類型"],
                storageKey: "ancestryCardFilterState",
                columnWidths: { 名稱: '10%', 特性1名稱: '10%', 特性2名稱: '10%' }
            };

            try {
                // First selection
                const selectedItem1 = await showDataTableModal(RACES_DATA, null, modalConfig);

                // Second selection
                modalConfig.title = "選擇第二個種族";
                const selectedItem2 = await showDataTableModal(RACES_DATA, null, modalConfig);

                const raceTextbox = document.getElementById('RaceTextbox');
                if (raceTextbox) {
                    if (selectedItem1.名稱 === selectedItem2.名稱) {
                        // If both selections are the same, treat as a single selection
                        raceTextbox.value = selectedItem1.名稱 || '';
                        createCard(selectedItem1);
                    } else {
                        // If selections are different, create a new mixed-race object
                        const desc1Parts = selectedItem1.描述.split('\n');
                        const desc2Parts = selectedItem2.描述.split('\n');

                        const mixedRace = {
                            "名稱": `${selectedItem1.名稱}+${selectedItem2.名稱}`,
                            "類型": "種族",
                            "描述": `${desc1Parts[0]}\n\n${desc2Parts[1]}`
                        };
                        
                        raceTextbox.value = mixedRace.名稱;
                        createCard(mixedRace);
                    }
                }

            } catch (error) {
                console.log('Race selection was cancelled.', error);
            }
        });
    }

    // Community Cards
    const addCommunityCardBtn = document.getElementById('add-community-card-btn');
    if (addCommunityCardBtn) {
        addCommunityCardBtn.addEventListener('click', () => {
            if (typeof COMM_DATA === 'undefined') {
                console.error('Data source variable "COMM_DATA" is not defined.');
                alert('錯誤：社群數據源未定義。');
                return;
            }

            const modalConfig = {
                title: "選擇社群",
                hiddenColumns: ["簡介","性格","類型"],
                storageKey: "communityCardFilterState",
                columnWidths: { 名稱: '10%', 特性名稱: '10%'}
            };

            showDataTableModal(COMM_DATA, (selectedItem) => {
                const communityTextbox = document.getElementById('CommunityTextbox');
                if (communityTextbox) {
                    communityTextbox.value = selectedItem.名稱 || '';
                }
                createCard(selectedItem);
            }, modalConfig);
        });
    }

    // Beast Form Cards
    const addBeastFormCardBtn = document.getElementById('add-beast-form-card-btn');
    if (addBeastFormCardBtn) {
        addBeastFormCardBtn.addEventListener('click', () => {
            if (typeof BEAST_FORM === 'undefined') {
                console.error('Data source variable "BEAST_FORM" is not defined.');
                alert('錯誤：野獸形態數據源未定義。');
                return;
            }

            const modalConfig = {
                title: "選擇野獸形態",
                hiddenColumns: ["例子"],
                filterableColumns: ["位階", "屬性", "閃避值", "攻擊範圍", "攻擊屬性", "攻擊傷害", "攻擊類型", "取得優勢"],
                storageKey: "beastFormCardFilterState",
                columnWidths: { 名稱: '10%', 位階: '5%', 屬性: '5%', 閃避值: '5%', 攻擊範圍: '5%', 攻擊屬性: '5%', 攻擊傷害: '5%', 攻擊類型: '5%', 獲得優勢: '10%'}
            };

            showDataTableModal(BEAST_FORM, (selectedItem) => {
                createCard(selectedItem);
            }, modalConfig);
        });
    }

    // Class Cards
    const addClassCardBtn = document.getElementById('add-class-card-btn');
    if (addClassCardBtn) {
        addClassCardBtn.addEventListener('click', () => {
            if (typeof MAIN_CLASS === 'undefined') {
                console.error('Data source variable "MAIN_CLASS" is not defined.');
                alert('錯誤：職業數據源未定義。');
                return;
            }

            const modalConfig = {
                title: "選擇職業",
                storageKey: "classCardFilterState",
                hiddenColumns: ["背景問題", "關係問題"],
                columnWidths: { 名稱: '7%', 領域: '7%', 初始閃避值: '5%', 初始生命點: '5%', 希望特性: '15%'}
            };

            showDataTableModal(MAIN_CLASS, (selectedItem) => {
                // Store selected class domain in the hidden textbox
                const classDomainTextbox = document.getElementById('ClassDomainTextbox');
                if (classDomainTextbox) {
                    classDomainTextbox.value = selectedItem.領域 || '';
                }

                // Fill Class Name
                const classTextbox = document.getElementById('ClassTextbox');
                if (classTextbox) {
                    classTextbox.value = selectedItem.名稱 || '';
                }

                // Fill Evasion
                const evasionTextbox = document.getElementById('EvasionTextbox');
                if (evasionTextbox) {
                    evasionTextbox.value = selectedItem.初始閃避值 || '';
                }

                // Fill HP
                const initialHp = parseInt(selectedItem.初始生命點, 10);
                if (!isNaN(initialHp)) {
                    const hpSlots = document.querySelectorAll('#hp-container .hp-slot-checkbox');
                    hpSlots.forEach((slot, index) => {
                        if (index < initialHp) {
                            slot.dataset.state = '0'; // empty
                        } else {
                            slot.dataset.state = '2'; // dash
                        }
                        updateCheckboxVisualState(slot);
                    });
                }

                const classFeatureTextbox = document.getElementById('ClassFeatureTextbox');
                if (classFeatureTextbox) {
                    classFeatureTextbox.value = removeMarkdownFormatting(`${selectedItem.希望特性}\n\n${selectedItem.職業特性}`);
                }

                const backgroundQuestion1 = document.getElementById('BackgroundQuestion1Textbox');
                const backgroundQuestion2 = document.getElementById('BackgroundQuestion2Textbox');
                const backgroundQuestion3 = document.getElementById('BackgroundQuestion3Textbox');
                if (backgroundQuestion1 && backgroundQuestion2 && backgroundQuestion3 && selectedItem.背景問題) {
                    backgroundQuestion1.value = selectedItem.背景問題[0] || '';
                    backgroundQuestion2.value = selectedItem.背景問題[1] || '';
                    backgroundQuestion3.value = selectedItem.背景問題[2] || '';
                }

                const connectQuestion1 = document.getElementById('ConnectQuestion1Textbox');
                const connectQuestion2 = document.getElementById('ConnectQuestion2Textbox');
                const connectQuestion3 = document.getElementById('ConnectQuestion3Textbox');
                if (connectQuestion1 && connectQuestion2 && connectQuestion3 && selectedItem.关系問題) {
                    connectQuestion1.value = selectedItem.关系問題[0] || '';
                    connectQuestion2.value = selectedItem.关系問題[1] || '';
                    connectQuestion3.value = selectedItem.关系問題[2] || '';
                }
                
                const subClassBtn = document.getElementById('add-subclass-card-btn');
                if (subClassBtn) {
                    subClassBtn.dataset.parentClass = selectedItem.名稱;
                    setTimeout(() => {
                        subClassBtn.click();
                    }, 100);
                }
            }, modalConfig);
        });
    }

    // Subclass Cards
    const addSubclassCardBtn = document.getElementById('add-subclass-card-btn');
    if (addSubclassCardBtn) {
        addSubclassCardBtn.addEventListener('click', function() {
            if (typeof SUB_CLASS === 'undefined') {
                console.error('Data source variable "SUB_CLASS" is not defined.');
                alert('錯誤：子職業數據源未定義。');
                return;
            }

            const parentClass = this.dataset.parentClass;
            
            if (parentClass) {
                localStorage.removeItem("subclassCardFilterState");
            }

            const preselectedFilters = parentClass ? { "主職": parentClass } : {};

            const modalConfig = {
                title: "選擇子職業",
                filterableColumns: ["主職"],
                storageKey: "subclassCardFilterState",
                columnWidths: { 名稱: '10%', 主職: '10%', 施法屬性: '7%', 等級: '7%'},
                preselectedFilters: preselectedFilters
            };

            showDataTableModal(SUB_CLASS, (selectedItem) => {
                const classTextbox = document.getElementById('ClassTextbox');
                if (classTextbox && selectedItem.主職 && selectedItem.名稱) {
                    const mainClassName = selectedItem.主職;
                    let subClassName = selectedItem.名稱;
                    const lastDashIndex = subClassName.lastIndexOf('-');

                    if (lastDashIndex > -1) {
                        subClassName = subClassName.substring(0, lastDashIndex).trim();
                    }
                    
                    classTextbox.value = `${mainClassName}-${subClassName}`;
                }
                createCard(selectedItem);
            }, modalConfig);

            if (parentClass) {
                delete this.dataset.parentClass;
            }
        });
    }
}
