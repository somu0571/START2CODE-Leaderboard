import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateCategoryData {
  leaderboardCategory_insert: LeaderboardCategory_Key;
}

export interface CreateRankData {
  rankSnapshot_insert: RankSnapshot_Key;
}

export interface CreateScoreData {
  score_insert: Score_Key;
}

export interface CreateSeasonData {
  season_insert: Season_Key;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface DeleteCategoryData {
  leaderboardCategory_delete?: LeaderboardCategory_Key | null;
}

export interface DeleteRankData {
  rankSnapshot_delete?: RankSnapshot_Key | null;
}

export interface DeleteScoreData {
  score_delete?: Score_Key | null;
}

export interface DeleteSeasonData {
  season_delete?: Season_Key | null;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface GetCategoryData {
  leaderboardCategory?: {
    name: string;
  };
}

export interface GetCurrentUserData {
  user?: {
    username: string;
    email: string;
  };
}

export interface GetRankData {
  rankSnapshot?: {
    rankPosition: number;
  };
}

export interface GetScoreData {
  score?: {
    value: Int64String;
  };
}

export interface GetSeasonData {
  season?: {
    name: string;
  };
}

export interface LeaderboardCategory_Key {
  id: UUIDString;
  __typename?: 'LeaderboardCategory_Key';
}

export interface ListAllUsersData {
  users: ({
    username: string;
  })[];
}

export interface ListCategoriesData {
  leaderboardCategories: ({
    name: string;
  })[];
}

export interface ListRanksData {
  rankSnapshots: ({
    rankPosition: number;
    scoreValue: Int64String;
  })[];
}

export interface ListSeasonsData {
  seasons: ({
    name: string;
  })[];
}

export interface ListUserScoresData {
  scores: ({
    value: Int64String;
    submittedAt: TimestampString;
  })[];
}

export interface RankSnapshot_Key {
  id: UUIDString;
  __typename?: 'RankSnapshot_Key';
}

export interface Score_Key {
  id: UUIDString;
  __typename?: 'Score_Key';
}

export interface Season_Key {
  id: UUIDString;
  __typename?: 'Season_Key';
}

export interface UpdateCategoryData {
  leaderboardCategory_update?: LeaderboardCategory_Key | null;
}

export interface UpdateRankData {
  rankSnapshot_update?: RankSnapshot_Key | null;
}

export interface UpdateScoreData {
  score_update?: Score_Key | null;
}

export interface UpdateSeasonData {
  season_update?: Season_Key | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUser(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteUser' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteUser(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserData>>;

/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to execute without passing in DataConnect. */
export function getCurrentUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to pass in custom DataConnect instances. */
export function getCurrentUser(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListAllUsers' Query. Allow users to execute without passing in DataConnect. */
export function listAllUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListAllUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listAllUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllUsersData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCategory' Mutation. Allow users to execute without passing in DataConnect. */
export function createCategory(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCategoryData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCategory' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCategory(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCategoryData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateCategory' Mutation. Allow users to execute without passing in DataConnect. */
export function updateCategory(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateCategoryData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateCategory' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateCategory(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateCategoryData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteCategory' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteCategory(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteCategoryData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteCategory' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteCategory(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteCategoryData>>;

/** Generated Node Admin SDK operation action function for the 'GetCategory' Query. Allow users to execute without passing in DataConnect. */
export function getCategory(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCategoryData>>;
/** Generated Node Admin SDK operation action function for the 'GetCategory' Query. Allow users to pass in custom DataConnect instances. */
export function getCategory(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCategoryData>>;

/** Generated Node Admin SDK operation action function for the 'ListCategories' Query. Allow users to execute without passing in DataConnect. */
export function listCategories(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCategoriesData>>;
/** Generated Node Admin SDK operation action function for the 'ListCategories' Query. Allow users to pass in custom DataConnect instances. */
export function listCategories(options?: OperationOptions): Promise<ExecuteOperationResponse<ListCategoriesData>>;

/** Generated Node Admin SDK operation action function for the 'CreateSeason' Mutation. Allow users to execute without passing in DataConnect. */
export function createSeason(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSeasonData>>;
/** Generated Node Admin SDK operation action function for the 'CreateSeason' Mutation. Allow users to pass in custom DataConnect instances. */
export function createSeason(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSeasonData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateSeason' Mutation. Allow users to execute without passing in DataConnect. */
export function updateSeason(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSeasonData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateSeason' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateSeason(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSeasonData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteSeason' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteSeason(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteSeasonData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteSeason' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteSeason(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteSeasonData>>;

/** Generated Node Admin SDK operation action function for the 'GetSeason' Query. Allow users to execute without passing in DataConnect. */
export function getSeason(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetSeasonData>>;
/** Generated Node Admin SDK operation action function for the 'GetSeason' Query. Allow users to pass in custom DataConnect instances. */
export function getSeason(options?: OperationOptions): Promise<ExecuteOperationResponse<GetSeasonData>>;

/** Generated Node Admin SDK operation action function for the 'ListSeasons' Query. Allow users to execute without passing in DataConnect. */
export function listSeasons(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSeasonsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSeasons' Query. Allow users to pass in custom DataConnect instances. */
export function listSeasons(options?: OperationOptions): Promise<ExecuteOperationResponse<ListSeasonsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateScore' Mutation. Allow users to execute without passing in DataConnect. */
export function createScore(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateScoreData>>;
/** Generated Node Admin SDK operation action function for the 'CreateScore' Mutation. Allow users to pass in custom DataConnect instances. */
export function createScore(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateScoreData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateScore' Mutation. Allow users to execute without passing in DataConnect. */
export function updateScore(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateScoreData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateScore' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateScore(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateScoreData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteScore' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteScore(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteScoreData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteScore' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteScore(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteScoreData>>;

/** Generated Node Admin SDK operation action function for the 'GetScore' Query. Allow users to execute without passing in DataConnect. */
export function getScore(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetScoreData>>;
/** Generated Node Admin SDK operation action function for the 'GetScore' Query. Allow users to pass in custom DataConnect instances. */
export function getScore(options?: OperationOptions): Promise<ExecuteOperationResponse<GetScoreData>>;

/** Generated Node Admin SDK operation action function for the 'ListUserScores' Query. Allow users to execute without passing in DataConnect. */
export function listUserScores(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserScoresData>>;
/** Generated Node Admin SDK operation action function for the 'ListUserScores' Query. Allow users to pass in custom DataConnect instances. */
export function listUserScores(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUserScoresData>>;

/** Generated Node Admin SDK operation action function for the 'CreateRank' Mutation. Allow users to execute without passing in DataConnect. */
export function createRank(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateRankData>>;
/** Generated Node Admin SDK operation action function for the 'CreateRank' Mutation. Allow users to pass in custom DataConnect instances. */
export function createRank(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateRankData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateRank' Mutation. Allow users to execute without passing in DataConnect. */
export function updateRank(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateRankData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateRank' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateRank(options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateRankData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteRank' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteRank(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteRankData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteRank' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteRank(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteRankData>>;

/** Generated Node Admin SDK operation action function for the 'GetRank' Query. Allow users to execute without passing in DataConnect. */
export function getRank(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetRankData>>;
/** Generated Node Admin SDK operation action function for the 'GetRank' Query. Allow users to pass in custom DataConnect instances. */
export function getRank(options?: OperationOptions): Promise<ExecuteOperationResponse<GetRankData>>;

/** Generated Node Admin SDK operation action function for the 'ListRanks' Query. Allow users to execute without passing in DataConnect. */
export function listRanks(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListRanksData>>;
/** Generated Node Admin SDK operation action function for the 'ListRanks' Query. Allow users to pass in custom DataConnect instances. */
export function listRanks(options?: OperationOptions): Promise<ExecuteOperationResponse<ListRanksData>>;

