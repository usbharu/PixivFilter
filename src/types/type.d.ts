type UserData = { userId: string; userName: string };
type RequestFlag = { requestFlag: boolean };

type WorksData = Array<{
  id: string;
  title: string;
  illustType?: number;
  xRestrict: number;
  restrict: number;
  sl?: number;
  url: string;
  description: string;
  tags: Array<string>;
  userId: string;
  userName: string;
  width?: number;
  height?: number;
  pageCount?: number;
  isBookmarkable: boolean;
  bookmarkData: unknown;
  alt?: string;
  titleCaptionTranslation: {
    workTitle: unknown;
    workCaption: unknown;
  };
  createDate: string;
  updateDate: string;
  isUnlisted: boolean;
  isMasked: boolean;
  profileImageUrl: string;
  textCount?: number;
  wordCount?: number;
  readingTime?: number;
  useWordCount?: boolean;
  bookmarkCount?: number;
  isOriginal?: boolean;
  marker: unknown;
  seriesId?: string;
  seriesTitle?: string;
}>;

type SearchTop = {
  body: {
    illustManga?: { data: WorksData };
    novel?: { data: WorksData };
    popular?: { recent: WorksData; permanent: WorksData };
  };
};

type Illustrations = {
  body: {
    illust?: { data: WorksData };
    popular?: { recent: WorksData; permanent: WorksData };
    thumbnails?: { illust: WorksData; novel: WorksData };
  };
};

type Manga = {
  body: {
    manga?: { data: WorksData };
    popular?: { recent: WorksData; permanent: WorksData };
    thumbnails?: { illust: WorksData; novel: WorksData };
  };
};

type Novels = {
  body: {
    novel?: { data: WorksData };
    thumbnails?: {
      illust: WorksData;
      novel: WorksData;
      novelSeries: WorksData;
    };
  };
};

type Artworks = SearchTop;
