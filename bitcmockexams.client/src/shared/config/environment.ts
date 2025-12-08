/**
 * Environment configuration for API endpoints
 * Matches the Angular project's environment structure
 */

const isDev = process.env.NODE_ENV === 'development';

export const environment = {
    production: !isDev,

    // API Base URLs - Development uses proxy paths, Production uses direct URLs
    identityUrl: isDev
        ? '/a2z-identity/api'
        : 'https://a2z-identity.azurewebsites.net/api',

    interviewQuestionUrl: isDev
        ? '/interview-questions/api'
        : 'https://interviewquestionsapi.azurewebsites.net/api',

    learningUrl: isDev
        ? '/learning/api'
        : 'https://learningcoursesapi.azurewebsites.net/api',

    eventUrl: isDev
        ? '/a2z-events/api'
        : 'https://a2z-events.azurewebsites.net/api',

    newsUrl: isDev
        ? '/a2z-news/api'
        : 'https://a2z-news.azurewebsites.net/api',

    trainingUrl: isDev
        ? '/training/api'
        : 'https://trainingcoursesapi.azurewebsites.net/api',

    searchUrl: isDev
        ? '/search/api'
        : 'https://searchapi.azurewebsites.net/api',

    testsUrl: isDev
        ? '/a2z-tests/api'
        : 'https://a2z-tests.azurewebsites.net/api',

    jobsUrl: isDev
        ? '/a2z-jobs/api/Jobs'
        : 'https://a2z-jobs.azurewebsites.net/api/Jobs',

    forumsUrl: isDev
        ? '/a2z-forums/api'
        : 'https://a2z-forums.azurewebsites.net/api',

    youtubeUrl: isDev
        ? '/youtube/api/Youtube'
        : 'https://youtubevideosapi.azurewebsites.net/api/Youtube',

    subscriptionUrl: isDev
        ? '/subscription/api'
        : 'https://subscriptionapi.azurewebsites.net/api',

    forumImageUrl: isDev
        ? '/a2z-forums/api/Forums/AddForumImage'
        : 'https://a2z-forums.azurewebsites.net/api/Forums/AddForumImage',

    pointsUrl: isDev
        ? '/points/api'
        : 'https://pointsapi.azurewebsites.net/api',

    notificationsUrl: isDev
        ? '/notifications/api'
        : 'https://notificationserverapi.azurewebsites.net/api',

    certificationsUrl: isDev
        ? '/certifications/api'
        : 'https://certificationsapi.azurewebsites.net/api',

    feedbackUrl: isDev
        ? '/a2z-feedback/api'
        : 'https://a2z-feedback.azurewebsites.net/api',

    popupUrl: isDev
        ? '/popup/api'
        : 'https://azurea2z-popupapi.azurewebsites.net/api',

    articlesUrl: isDev
        ? '/articles/api'
        : 'http://localhost:1106/api', // Note: This was localhost in your Angular config
};

export default environment;
