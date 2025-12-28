const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Core Identity
    firebaseUid: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true, minlength: 1, maxlength: 50 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30, match: /^[a-z0-9_]+$/, index: true },
    email: { type: String, required: true, lowercase: true, index: true },

    // A. PROFILE & IDENTITY SETTINGS
    profile: {
        // Profile Information
        photoURL: { type: String, default: '' },
        coverPhotoURL: { type: String, default: '' },
        bio: { type: String, default: 'Hey there! I am using G-Network.', maxlength: 300 },
        gender: { type: String, enum: ['male', 'female', 'non-binary', 'custom', 'prefer_not_to_say', ''], default: '' },
        customGender: String,
        birthDate: {
            date: Date,
            privacy: { type: String, enum: ['full', 'month_day', 'age', 'hidden'], default: 'hidden' }
        },
        pronouns: { type: String, default: '', maxlength: 30 },
        website: String,
        socialLinks: {
            instagram: String,
            twitter: String,
            youtube: String,
            tiktok: String,
            linkedin: String
        },
        location: {
            name: String,
            city: String,
            country: String,
            lat: Number,
            lng: Number,
            privacy: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' }
        },
        languages: [String],
        interests: [String],

        // Profile Customization
        themeColor: { type: String, default: '#6366f1' },
        profileLayout: { type: String, enum: ['grid', 'list'], default: 'grid' },
        highlightedPosts: [String],
        featuredStories: [String],
        showBadge: { type: Boolean, default: true },
        linkInBio: [{ title: String, url: String }],
        profileSoundtrack: String
    },

    // Change Tracking
    usernameHistory: [{ username: String, changedAt: { type: Date, default: Date.now } }],
    lastUsernameChange: Date,
    lastDisplayNameChange: Date,

    // Verification & Status
    verification: {
        isVerified: { type: Boolean, default: false },
        badgeType: { type: String, enum: ['official', 'creator', 'business', 'none'], default: 'none' },
        verifiedAt: Date
    },

    techStack: [String],
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketIds: [{ type: String }],

    // B. PRIVACY & SECURITY SETTINGS
    privacy: {
        // Account Privacy
        isPrivate: { type: Boolean, default: false },
        profileVisibility: { type: String, enum: ['public', 'private', 'followers_only'], default: 'public' },
        hideFromSearchEngines: { type: Boolean, default: false },
        showActivityStatus: { type: Boolean, default: true },
        showReadReceipts: { type: Boolean, default: true },

        // Content Privacy
        defaultPostVisibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
        storyPrivacy: { type: String, enum: ['everyone', 'followers', 'close_friends', 'custom'], default: 'everyone' },
        allowStoryReplies: { type: String, enum: ['everyone', 'followers', 'people_you_follow', 'nobody'], default: 'everyone' },
        allowPostSharing: { type: Boolean, default: true },
        allowPostDownloads: { type: Boolean, default: true },
        showViewCounts: { type: Boolean, default: true },
        hideLikes: { type: Boolean, default: false },
        autoArchivePosts: { type: Boolean, default: false },
        autoArchiveDays: { type: Number, default: 365 },

        // Interaction Privacy
        allowComments: { type: String, enum: ['everyone', 'followers', 'people_you_follow', 'nobody'], default: 'everyone' },
        commentFiltering: { type: Boolean, default: false },
        filterKeywords: [String],
        whoCanMention: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        whoCanTag: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        reviewTagsBeforeShow: { type: Boolean, default: false },
        whoCanMessage: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        messageRequests: { type: Boolean, default: true },
        voiceVideoCallPermissions: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'followers' },
        groupChatInvitations: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },

        // Visibility Controls
        whoCanSeeFollowing: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        whoCanSeeFollowers: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        showOnlineStatus: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        showLastSeen: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
        showTypingIndicator: { type: Boolean, default: true }
    },

    // Security
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorMethod: { type: String, enum: ['none', 'totp', 'sms', 'email'], default: 'none' },
        twoFactorSecret: String,
        backupCodes: [String],
        loginAlerts: { type: Boolean, default: true },
        loginApprovalNewDevices: { type: Boolean, default: true },

        trustedDevices: [{
            deviceId: String,
            deviceName: String,
            deviceInfo: String,
            trustedAt: { type: Date, default: Date.now },
            expiresAt: Date,
            location: String
        }],

        activeSessions: [{
            sessionId: String,
            deviceInfo: String,
            deviceName: String,
            location: String,
            ipAddress: String,
            lastActive: { type: Date, default: Date.now },
            createdAt: { type: Date, default: Date.now }
        }],

        connectedApps: [{
            appId: String,
            appName: String,
            permissions: [String],
            connectedAt: Date,
            lastUsed: Date
        }],

        passwordLastChanged: { type: Date, default: Date.now },
        securityAlerts: { type: Boolean, default: true },
        biometricLogin: { type: Boolean, default: false },

        loginHistory: [{
            timestamp: { type: Date, default: Date.now },
            location: String,
            device: String,
            ipAddress: String,
            success: Boolean
        }]
    },

    // Chat Preferences
    chatPreferences: {
        wallpaper: { type: String, default: 'default' }, // 'default', 'color', 'image_url'
        wallpaperColor: { type: String, default: '#e5e5e5' },
        enterToSend: { type: Boolean, default: true },
        mediaAutoDownload: { type: Boolean, default: true },
        fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
    },

    // C. NOTIFICATIONS SETTINGS
    notifications: {
        push: {
            enabled: { type: Boolean, default: true },
            likes: { type: Boolean, default: true },
            comments: { type: String, enum: ['all', 'friends', 'off', 'true', 'false'], default: 'all' },
            newFollowers: { type: Boolean, default: true },
            mentions: { type: Boolean, default: true },
            directMessages: { type: Boolean, default: true },
            messageSound: { type: Boolean, default: true },
            storyReplies: { type: Boolean, default: true },
            videoCalls: { type: Boolean, default: true },
            liveStreams: { type: Boolean, default: true },
            postsFromFollowed: { type: Boolean, default: true },
            storiesFromFollowed: { type: Boolean, default: true },
            recommended: { type: Boolean, default: false },
            trending: { type: Boolean, default: false },
            reminders: { type: Boolean, default: true },
            sound: { type: Boolean, default: true },
            vibration: { type: Boolean, default: true },
            showPreview: { type: Boolean, default: true }
        },

        email: {
            frequency: { type: String, enum: ['realtime', 'daily', 'weekly', 'off'], default: 'weekly' },
            security: { type: Boolean, default: true },
            messagesSummary: { type: Boolean, default: true },
            weeklyDigest: { type: Boolean, default: true },
            followersRecap: { type: Boolean, default: true },
            creatorInsights: { type: Boolean, default: false },
            productAnnouncements: { type: Boolean, default: false },
            marketing: { type: Boolean, default: false },
            policyUpdates: { type: Boolean, default: true }
        },

        inApp: {
            badgeCount: { type: Boolean, default: true },
            groupNotifications: { type: Boolean, default: true }
        },

        doNotDisturb: {
            enabled: { type: Boolean, default: false },
            schedule: [{
                days: [String],
                startTime: String,
                endTime: String,
                timezone: String
            }],
            exceptions: [String],
            autoReplyMessage: String
        },

        intelligentDelivery: { type: Boolean, default: false }
    },

    // D. CONTENT & FEED PREFERENCES
    contentPreferences: {
        // Feed Customization
        defaultFeed: { type: String, enum: ['following', 'for_you', 'favorites'], default: 'following' },
        showSuggested: { type: Boolean, default: true },
        showSponsored: { type: Boolean, default: true },
        autoplayVideos: { type: String, enum: ['always', 'wifi_only', 'never'], default: 'wifi_only' },
        videoSound: { type: String, enum: ['mute', 'remember'], default: 'mute' },
        postDisplayDensity: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
        infiniteScroll: { type: Boolean, default: true },

        // Content Filters
        sensitiveContent: { type: String, enum: ['strict', 'moderate', 'off'], default: 'moderate' },
        politicalContent: { type: String, enum: ['show_less', 'show_more', 'normal'], default: 'normal' },
        healthFitnessContent: { type: String, enum: ['show_less', 'show_more', 'normal'], default: 'normal' },
        financialContent: { type: String, enum: ['show_less', 'show_more', 'normal'], default: 'normal' },
        religiousContent: { type: String, enum: ['show_less', 'show_more', 'normal'], default: 'normal' },
        adultContentRestriction: { type: Boolean, default: true },
        violenceWarning: { type: Boolean, default: true },
        spoilerWarning: { type: Boolean, default: true },

        interests: [String],
        mutedTopics: [{
            keyword: String,
            type: { type: String, enum: ['exact', 'contains'], default: 'contains' },
            duration: String,
            scope: { type: String, enum: ['posts', 'stories', 'all'], default: 'all' }
        }],
        mutedHashtags: [String],

        // Language & Region
        primaryLanguage: { type: String, default: 'en' },
        contentLanguages: [{ type: String, default: ['en'] }],
        autoTranslate: { type: Boolean, default: false },
        autoTranslateLanguages: [String],
        timezone: String,
        dateFormat: { type: String, enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], default: 'MM/DD/YYYY' },
        temperatureUnit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },

        // Display Preferences
        loadHighQualityImages: { type: String, enum: ['always', 'wifi_only', 'never'], default: 'wifi_only' },
        dataSaverMode: { type: Boolean, default: false },
        blurSensitiveMedia: { type: Boolean, default: true },
        hideSpoilers: { type: Boolean, default: true },
        filterProfanity: { type: Boolean, default: false },
        minimumAestheticScore: { type: Number, default: 0.0, min: 0, max: 1 }
    },

    // E. CONNECTIONS & RELATIONSHIPS
    connections: {
        // Follow Management
        autoAcceptFollowRequests: { type: Boolean, default: false },
        followerListVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
        followingListVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
        showMutualFriends: { type: Boolean, default: true },
        suggestedAccounts: { type: Boolean, default: true },
        peopleYouMayKnow: { type: Boolean, default: true },

        // Lists
        closeFriends: [String],
        favorites: [String]
    },

    // Safety & Relationships
    blockedUsers: [String],
    mutedUsers: [{
        userId: String,
        mutedAt: { type: Date, default: Date.now },
        muteUntil: Date
    }],
    restrictedUsers: [{
        userId: String,
        restrictedAt: { type: Date, default: Date.now }
    }],
    mutedWords: [String],

    followers: [String],
    following: [String],
    followRequests: [String],

    // F. DATA & STORAGE SETTINGS
    dataStorage: {
        // Data Usage
        mobileDataUsage: { type: String, enum: ['low', 'standard', 'high'], default: 'standard' },
        videoQualityCellular: { type: String, enum: ['auto', 'hd', 'standard'], default: 'standard' },
        videoQualityWiFi: { type: String, enum: ['auto', 'hd', '4k'], default: 'hd' },
        imageQuality: { type: String, enum: ['low', 'standard', 'high'], default: 'standard' },
        autoDownloadMedia: { type: Boolean, default: true },
        cacheFrequency: { type: String, enum: ['never', 'weekly', 'monthly'], default: 'monthly' },

        // Data Control
        adPersonalization: { type: Boolean, default: true },
        dataSharing: { type: Boolean, default: false },
        locationData: { type: Boolean, default: false },
        usageAnalytics: { type: Boolean, default: true },

        // Backup & Sync
        autoBackup: { type: Boolean, default: false },
        backupFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
        backupContent: [String],
        crossDeviceSync: { type: Boolean, default: true },
        chatBackupEncryption: { type: Boolean, default: true }
    },

    // Data Governance Controls
    dataControls: {
        personalizedRecommendations: { type: Boolean, default: true },
        useActivityForRecommendations: { type: Boolean, default: true },
        useLocationForContent: { type: Boolean, default: false },
        shareDiagnosticData: { type: Boolean, default: true },
        participateInResearch: { type: Boolean, default: false },
        allowAnonymousAnalytics: { type: Boolean, default: true },
        searchHistory: { type: Boolean, default: true }
    },

    // G. ACCESSIBILITY SETTINGS
    accessibility: {
        // Visual
        textSize: { type: String, enum: ['small', 'medium', 'large', 'extra_large'], default: 'medium' },
        boldText: { type: Boolean, default: false },
        highContrast: { type: Boolean, default: false },
        darkMode: { type: String, enum: ['auto', 'light', 'dark'], default: 'auto' },
        reduceTransparency: { type: Boolean, default: false },
        colorBlindMode: { type: String, enum: ['none', 'protanopia', 'deuteranopia', 'tritanopia'], default: 'none' },
        reduceMotion: { type: Boolean, default: false },
        screenReader: { type: Boolean, default: false },

        // Audio
        monoAudio: { type: Boolean, default: false },
        backgroundSoundsReduction: { type: Boolean, default: false },

        // Interaction
        touchAccommodation: { type: Boolean, default: false },
        shakeToUndo: { type: Boolean, default: true },
        autoCorrect: { type: Boolean, default: true },
        predictiveText: { type: Boolean, default: true },
        voiceControl: { type: Boolean, default: false },
        autoCaptions: { type: Boolean, default: false }
    },

    // H. CREATOR & BUSINESS SETTINGS
    creatorMode: {
        enabled: { type: Boolean, default: false },
        category: { type: String, enum: ['artist', 'musician', 'writer', 'educator', 'developer', 'business', 'personal', 'other'], default: 'other' },
        customCategory: String,
        businessHours: String,
        contactInfo: String,
        servicesOffered: [String],
        portfolioShowcase: [String],
        collaborationStatus: { type: String, enum: ['open', 'closed', 'selective'], default: 'closed' },
        rateCard: { visible: Boolean, url: String },

        // Content Management
        postScheduling: { type: Boolean, default: false },
        autoResponder: { enabled: Boolean, message: String },
        watermarkEnabled: { type: Boolean, default: false },
        watermarkText: String,
        copyrightInfo: String,
        attributionRequired: { type: Boolean, default: false },

        // Monetization
        monetizationEnabled: { type: Boolean, default: false },
        paymentMethod: String,
        payoutSchedule: { type: String, enum: ['weekly', 'monthly'], default: 'monthly' },
        subscriptionTiers: [{ name: String, price: Number, benefits: [String] }],
        tipJarEnabled: { type: Boolean, default: false },

        // Analytics
        insightsAccess: { type: String, enum: ['basic', 'advanced', 'pro'], default: 'basic' },
        publicMetrics: { type: Boolean, default: false }
    },

    // I. FAMILY & SAFETY
    familySafety: {
        // Parental Controls
        parentalControlsEnabled: { type: Boolean, default: false },
        screenTimeLimit: Number,
        contentRestrictions: { type: String, enum: ['child', 'teen', 'adult'], default: 'adult' },
        purchaseApprovals: { type: Boolean, default: false },
        friendRequestApprovals: { type: Boolean, default: false },
        locationSharingControls: { type: Boolean, default: false },
        bedtimeMode: { enabled: Boolean, start: String, end: String },

        // Digital Wellbeing
        dailyTimeLimit: Number,
        breakReminders: { type: Boolean, default: false },
        breakReminderInterval: { type: Number, default: 60 },
        nightMode: { enabled: Boolean, startTime: String, endTime: String },
        focusMode: { type: Boolean, default: false },
        notificationSummary: { type: Boolean, default: false }
    },

    // J. ACCOUNT MANAGEMENT
    accountStatus: {
        isActive: { type: Boolean, default: true },
        accountType: { type: String, enum: ['personal', 'creator', 'business'], default: 'personal' },
        isDeactivated: { type: Boolean, default: false },
        deactivatedAt: Date,
        isDeletionScheduled: { type: Boolean, default: false },
        deletionScheduledFor: Date,
        deactivationReason: String,
        violationHistory: [{ type: String, date: Date, severity: String }],
        warningLevel: { type: Number, default: 0, min: 0, max: 3 }
    },

    // K. ADVANCED & DEVELOPER SETTINGS
    advanced: {
        // API & Integration
        apiAccessEnabled: { type: Boolean, default: false },
        apiTokens: [{ token: String, name: String, createdAt: Date, lastUsed: Date }],
        webhooks: [{ url: String, events: [String], enabled: Boolean }],

        // Experimental Features
        betaProgramEnrolled: { type: Boolean, default: false },
        earlyAccessFeatures: { type: Boolean, default: false },
        abTestParticipation: { type: Boolean, default: true },

        // Debug & Technical
        debugMode: { type: Boolean, default: false },
        crashReporting: { type: Boolean, default: true },
        diagnosticDataSharing: { type: Boolean, default: true }
    },

    // Metadata
    settingsVersion: { type: Number, default: 2 },
    lastSettingChange: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes for performance
UserSchema.index({ username: 'text', displayName: 'text' });
UserSchema.index({ email: 1 });
UserSchema.index({ 'accountStatus.isActive': 1 });
UserSchema.index({ createdAt: -1 });

// Methods
UserSchema.methods.canUserView = function (requesterId) {
    if (this.firebaseUid === requesterId) return true;
    if (this.privacy.isPrivate) {
        return this.followers.includes(requesterId);
    }
    return true;
};

UserSchema.methods.isBlocked = function (userId) {
    return this.blockedUsers.includes(userId);
};

UserSchema.methods.isMuted = function (userId) {
    const mute = this.mutedUsers.find(m => m.userId === userId);
    if (!mute) return false;
    if (!mute.muteUntil) return true;
    return new Date() < mute.muteUntil;
};

UserSchema.methods.isInCloseFriends = function (userId) {
    return this.connections?.closeFriends?.includes(userId) || false;
};

module.exports = mongoose.model('User', UserSchema);
