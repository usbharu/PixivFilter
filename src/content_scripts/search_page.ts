import { ChromeStorage } from '../database/chrome_storage';
import '../css/style.css';

export const SearchPage = () => {
  async function searchPage() {
    console.log('content_script');

    // setNovelFlag();
    // await setUserNGButton();
    // await setTagToggleButton();
    /*  await setTagContainer();
    setNGButtonTagNovel(); */
    /*   const ngUsers = await ChromeStorage.getUser();
    ngUsers.forEach((user) => {
      hideNGUserWorks(user.userId);
    });

    const ngTags = await ChromeStorage.getTags();
    ngTags.forEach((tag) => {
      hideNGTagWorks(tag);
    }); */

    const getUserElements = () => {
      const targetElements = document.querySelectorAll('[aria-haspopup]');
      if (!targetElements) return [];

      const userNameElements = Array.from(targetElements).flatMap((element) => {
        return element.querySelectorAll('a')[1];
      });

      return userNameElements;
    };

    const createBlockUserAddButton = () => {
      const onClick = async (event: any) => {
        const userElement = (
          event.target as HTMLElement
        ).parentElement?.querySelector('[href*="users"]');
        const userId = userElement?.getAttribute('data-gtm-value') ?? '';
        const userName =
          userElement?.children[0]?.getAttribute('title') ??
          userElement?.textContent ??
          '';

        await ChromeStorage.setUser({ userId, userName });
        hideNGUserWorks(userId);
        console.log(userId, userName);
        console.log(userElement);
      };

      const addButtonElement = document.createElement('span');
      addButtonElement.className = 'pf-user-ng-button';
      addButtonElement.setAttribute('data-type', 'add');

      addButtonElement.textContent = '[+]';

      // addButtonElement.onclick = onClick
      return addButtonElement;
    };

    const setBlockUserAddButton = () => {
      getUserElements().forEach((element) => {
        if (element.parentElement?.querySelector('.pf-user-ng-button')) return;
        element.after(createBlockUserAddButton());
      });
    };

    const intervalEvent = () => {
      setInterval(() => {
        const userElementsCount = getUserElements().length;
        const addButtonELementsCount =
          document.querySelectorAll('.pf-user-ng-button').length;

        if (!(userElementsCount === addButtonELementsCount))
          setBlockUserAddButton();

        console.log('interval');
      }, 1000);
    };

    intervalEvent();
  }

  // user指定で作品を非表示にする
  const hideNGUserWorks = (ngUserId: string) => {
    const ngUserWorks: NodeListOf<HTMLElement> = document.querySelectorAll(
      `[data-gtm-value="${ngUserId}"]`
    );

    ngUserWorks.forEach((element) => {
      const liElement = element.closest('li');
      if (!liElement) return;
      liElement.style.display = 'none';
    });
  };

  const hideNGTagWorks = (NGTag: string) => {
    const ngTagWorks: NodeListOf<HTMLElement> = document.querySelectorAll(
      `[data-tag-name="${NGTag}"]`
    );

    ngTagWorks.forEach((element) => {
      const liElement = element.closest('li');
      if (!liElement) return;
      liElement.style.display = 'none';
    });
  };

  const createTagNGButton = (tag: string) => {
    const spanElementTagNgButton = document.createElement('span');
    spanElementTagNgButton.className = 'pf-tag-ng-button';
    spanElementTagNgButton.setAttribute('data-type', 'add');
    spanElementTagNgButton.setAttribute('data-tag-name', tag);
    spanElementTagNgButton.textContent = '[+]';
    spanElementTagNgButton.onclick = async (event) => {
      console.log(event.target);
      await ChromeStorage.setTag(tag);
      hideNGTagWorks(tag);
      return;
    };
    return spanElementTagNgButton;
  };

  //タグコンテナを作成する
  const createTagContainer = (worksTags: string[]) => {
    const divElement = document.createElement('div');
    divElement.className = 'pf-tag-container';
    divElement.style.display = 'none';
    worksTags.forEach((tag) => {
      const pElement = document.createElement('p');
      pElement.className = 'pf-work-tag';

      const aElement = document.createElement('a');
      aElement.className = 'pf-work-tag-link';
      aElement.target = '-blank';
      aElement.href = `https://www.pixiv.net/tags/${tag}`;
      aElement.textContent = tag;

      const spanElementTagNgButton = createTagNGButton(tag);

      pElement.appendChild(aElement);
      pElement.appendChild(spanElementTagNgButton);

      divElement.appendChild(pElement);
    });
    return divElement;
  };

  const setTagContainer = async () => {
    const getLiElement = (workId: string) => {
      const aElements = document.querySelectorAll(
        `[data-gtm-value="${workId}"]`
      );

      const LiElements = Array.from(aElements).flatMap((element) => {
        return element.closest('li') ?? [];
      });

      return LiElements;
    };
    const worksData = await ChromeStorage.getWorksData();
    worksData.forEach((workData) => {
      const LiElements = getLiElement(workData.id);
      LiElements.forEach((element) => {
        element.append(createTagContainer(workData.tags));
      });
    });
    return;
  };

  const setTagToggleButton = async () => {
    const createTagToggleButton = async () => {
      const toggleButtonElement = document.createElement('span');
      toggleButtonElement.className = 'pf-tag-toggle-button';
      toggleButtonElement.textContent = '▼';
      toggleButtonElement.onclick = (event) => {
        const selectedTagContainer = (event.target as HTMLElement)
          .closest('li')
          ?.querySelector<HTMLElement>('.pf-tag-container');

        if (!selectedTagContainer) return;
        if (toggleButtonElement.textContent === '▼') {
          toggleButtonElement.textContent = '▲';
          selectedTagContainer.style.display = '';
        } else {
          toggleButtonElement.textContent = '▼';
          selectedTagContainer.style.display = 'none';
        }
      };
      return toggleButtonElement;
    };

    const targetElements = document.querySelectorAll('[aria-haspopup]');

    targetElements.forEach(async (element) => {
      const isNovel = element.getAttribute('is-novel');
      if (isNovel === 'false') {
        element.parentElement?.append(await createTagToggleButton());
      }
    });
  };

  const setNGButtonTagNovel = () => {
    const aElements = document.querySelectorAll(
      '.gtm-novel-searchpage-result-tag'
    );

    aElements.forEach((element) => {
      const tag = element.getAttribute('data-gtm-label');
      if (!tag) return;
      element.closest('span')?.append(createTagNGButton(tag));
    });
  };

  searchPage();
  return;
};
