/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/content_script.ts ***!
  \*******************************/

(() => {
    //NG登録したユーザーのイラストを非表示
    const removeElement = (userOrTagObj) => new Promise((resolve) => {
        if (userOrTagObj.userKey) {
            const users = userOrTagObj.userKey;
            users.forEach((user) => {
                const userId = user.userId;
                const targets = document.querySelectorAll(`[href="/users/${userId}"]`);
                if (targets) {
                    targets.forEach((target) => {
                        target.closest('li').style.display = 'none';
                    });
                }
            });
        }
        else if (userOrTagObj.tagName) {
            const tags = userOrTagObj.tagName;
            tags.forEach((tag) => {
                const targets = document.querySelectorAll(`[data-tag-name="${tag}"]`);
                if (targets) {
                    targets.forEach((target) => {
                        target.closest('li').style.display = 'none';
                    });
                }
            });
        }
        resolve();
    });
    //ユーザー名の隣にNG登録するボタンとタグ表示ボタンを設置
    const createAddButton = async (elements) => new Promise(async (resolve, reject) => {
        await Promise.all(Array.from(elements).map(async (element, index) => {
            if (!element.parentElement.nextElementSibling) {
                const wrapperElement = document.createElement('div');
                wrapperElement.style.display = 'flex';
                wrapperElement.style.width = '100%';
                //ユーザー登録ボタンを設置
                const spanElementAddButton = document.createElement('span');
                spanElementAddButton.className = 'pf-user-add-button';
                spanElementAddButton.textContent = '[+]';
                //矢印を設置
                const toggleElement = document.createElement('span');
                toggleElement.className = 'pf-illust-info-toggle';
                toggleElement.textContent = '▼';
                toggleElement.style.userSelect = 'none';
                wrapperElement.appendChild(spanElementAddButton);
                wrapperElement.appendChild(toggleElement);
                // トグルボタンをユーザーごとの右端に配置するため
                element.parentElement.style.position = 'relative';
                element.after(wrapperElement);
                wrapperElement.prepend(element);
                return;
            }
        }));
        resolve();
    });
    // タグコンテナを設置する
    const setTagElement = async (elements, worksData) => {
        const getTargetWorksTag = (worksId) => {
            return new Promise((resolve, reject) => {
                worksData.forEach((data) => {
                    if (data.id === worksId) {
                        resolve(data.tags);
                    }
                });
            });
        };
        elements.forEach(async (target) => {
            const worksId = target
                .querySelector('[data-gtm-value]')
                .getAttribute('data-gtm-value');
            if (!worksId) {
                return;
            }
            const tags = await getTargetWorksTag(worksId);
            //タグコンテナを追加
            target.appendChild(await createTagContainer(tags));
        });
        return;
    };
    //タグコンテナを作成する
    const createTagContainer = async (illustTags) => {
        const divElement = document.createElement('div');
        divElement.className = 'pf-tag-container';
        divElement.style.display = 'none';
        illustTags.forEach((tag) => {
            const pElement = document.createElement('p');
            pElement.className = 'pf-illust-tag';
            const aElement = document.createElement('a');
            aElement.className = 'pf-illust-tag-link';
            aElement.target = '-blank';
            aElement.href = `https://www.pixiv.net/tags/${tag}`;
            aElement.textContent = tag;
            const spanElementTagNgButton = document.createElement('span');
            spanElementTagNgButton.className = 'pf-tag-ng-button';
            spanElementTagNgButton.setAttribute('data-type', 'add');
            spanElementTagNgButton.setAttribute('data-tag-name', tag);
            spanElementTagNgButton.textContent = '[+]';
            pElement.appendChild(aElement);
            pElement.appendChild(spanElementTagNgButton);
            divElement.appendChild(pElement);
        });
        return divElement;
    };
    //クリックイベント処理
    const clickEvent = (e) => {
        e.stopPropagation();
        const targetElement = e.target;
        const targetParent = targetElement
            .closest('li')
            ?.querySelector('.pf-tag-container');
        // ユーザーNGボタン
        if (targetElement.getAttribute('class') === 'pf-user-add-button') {
            const userName = e.composedPath()[1].firstElementChild
                ?.textContent;
            const userId = e.composedPath()[1]
                .querySelector('[href]')
                .getAttribute('href')
                .slice(7);
            console.log(userName, userId);
            addChoromeStorage({ userName: userName, userId: userId });
            removeElement({ userKey: [{ userName: userName, userId: userId }] });
            return;
        }
        if (!targetParent) {
            return;
        }
        // タグトグルボタン
        if (targetElement.getAttribute('class') === 'pf-illust-info-toggle' &&
            targetParent.style.display === 'none') {
            targetElement.textContent = '▲';
            targetParent.style.display = '';
        }
        else if (targetElement.getAttribute('class') === 'pf-illust-info-toggle' &&
            targetParent.style.display === '') {
            targetElement.textContent = '▼';
            targetParent.style.display = 'none';
        }
        // タグNGボタン
        if (targetElement.getAttribute('class') === 'pf-tag-ng-button') {
            const tagName = targetElement.getAttribute('data-tag-name');
            addChoromeStorage({ tagName: tagName });
            removeElement({ tagName: [tagName] });
        }
    };
    //NG登録ボタンを押したらChromeストレージに保存する
    const addChoromeStorage = async (clickedWorksData) => {
        const keys = Object.keys(clickedWorksData);
        // ユーザーの場合
        if ('userId' in clickedWorksData) {
            const users = await new Promise((resolve) => {
                chrome.storage.local.get(['userKey'], (results) => {
                    if (results.userKey) {
                        resolve(results.userKey);
                    }
                    else {
                        resolve([]);
                    }
                });
            });
            //重複している場合は保存しない
            //userIdのみの配列を作成
            const userIds = users.map((result) => result.userId);
            //クリックしたユーザーが保存されているかを確認
            if (userIds.includes(clickedWorksData.userId)) {
                return;
            }
            users.push(clickedWorksData);
            chrome.storage.local.set({ userKey: users });
            return;
        }
        // タグの場合
        if ('tagName' in clickedWorksData) {
            //保存してあるタグを取得
            const tags = await new Promise((resolve) => {
                chrome.storage.local.get(['tagName'], (results) => {
                    if (results.tagName) {
                        resolve(results.tagName);
                    }
                    else {
                        resolve([]);
                    }
                });
            });
            tags.push(clickedWorksData.tagName);
            //重複を削除
            const newTags = Array.from(new Set(tags));
            chrome.storage.local.set({ tagName: newTags });
            return;
        }
    };
    //ローカルストレージに保存されているNGキーワードの作品を非表示にする
    const checkGoogleStorage = () => chrome.storage.local.get(null, async (results) => {
        await removeElement({ userKey: results.userKey });
        await removeElement({ tagName: results.tagName });
    });
    document.addEventListener('click', clickEvent);
    const main = async (worksData) => {
        // 検索結果が0の場合は処理をしない
        if (!worksData.length) {
            return;
        }
        let count = 0;
        const interval = setInterval(async () => {
            count += 1;
            if (count === 30) {
                clearInterval(interval);
            }
            //要素が読み込まれるまで待機
            const monitoredElements = document.querySelectorAll('[aria-haspopup=true]');
            if (monitoredElements[0]) {
                clearInterval(interval);
                const workElements = Array.from(monitoredElements).flatMap((element) => element.closest('li') ?? []);
                await createAddButton(monitoredElements);
                await setTagElement(workElements, worksData);
                checkGoogleStorage();
            }
        }, 100);
    };
    chrome.runtime.onMessage.addListener((worksData) => {
        main(worksData);
    });
})();

/******/ })()
;