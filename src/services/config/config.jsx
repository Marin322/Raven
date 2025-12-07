export const API_CONFIG = {
    BASE_URL: 'https://ravenapp.ru', // базовый url для запроса
    AUTHENTICATION: {
        REGISTRATION: '/api/auth/register',
        AUTHORIZATION: '/api/auth/login',
        LOGOUT: '/api/auth/logout'
    },
    CHATS: {
        GETUSERCHATS: '/api/chats',
        CREATEPERSONALCHAT: '/api/chats/personal/' //targetUserId
    },
    USERS: {
        GETALLUSERS: '/api/users/list/search/user'
    },
    PROFILE: {
        GETPROFILE: '/api/users/' // userid
    },
    SETTINGS: {
        CHANGEAPPEARANCESETTINGS: '/api/users/settings/appearance'
    }
};