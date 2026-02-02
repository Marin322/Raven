export const API_CONFIG = {
    BASE_URL: 'https://ravenapp.ru', // базовый url для запроса
    AUTHENTICATION: {
        REGISTRATION: '/api/auth/register',
        AUTHORIZATION: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESHTOKEN: '/api/auth/refresh'
    },
    CHATS: {
        GETUSERCHATS: '/api/chats',
        CREATEPERSONALCHAT: '/api/chats/personal/', //targetUserId
        GETCURRENTCHAT: '/api/chats/', //chatid
        CREATEGROUPCHAT: '/api/chats/group'
    },
    USERS: {
        GETALLUSERS: '/api/users/list/search/user',
        GETUSERSTATUS: '/api/activity/status/' //targetuserid
    },
    PROFILE: {
        GETPROFILE: '/api/users/profile/', 
        GETUSERDEVICES: '/api/devices',
        REVOKEALLDEVICES: '/api/devices/revoke-all',
        REVOKEDEVICE: '/api/devices/revoke'
    },
    SETTINGS: {
        CHANGEAPPEARANCESETTINGS: '/api/users/settings/appearance'
    },
    AVATARS: {
        GETCHATAVATAR: '/api/files/presigned-url'
    },
    FILES: {
        UPLOAD: "/api/files/upload",
        DOWNLOAD: "/api/files/download",
        PRESIGNED_URL: "/api/files/presigned-url"
      },
};