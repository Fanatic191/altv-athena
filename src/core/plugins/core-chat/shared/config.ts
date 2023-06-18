export const CHAT_CONFIG = {
    settings: {
        // Maximum range for another player to speak to another player
        range: 35,
        commands: {
            oocDistance: 15,
            meDistance: 35,
            doDistance: 35,
            lowDistance: 10,
            whisperDistance: 5,
            oocColour: `{656565}`, // OOC Color
            roleplayColour: `{C39ADD}`, // Roleplay Color
            doColour: `{f9227d}`, // do color
            lowColour: `{d3d3d3}`, // Low Color
            whisperColour: `{e6e6ce}`, // Whisper Color
        },
    },
    behavior: {
        // Auto-scroll to bottom on new message
        scroll: true,
        // Show message indexes
        messageIndexes: false,
        // Default by showing timestamps
        timestamps: true,
        // Total messages to show on-screen
        display: 14,
        // Message length
        length: 250,
    },
    style: {
        // Max width of the message box
        'max-width': '400px',
        // Font size of the individual message
        'font-size': '16px',
        // The boldness of the message
        'font-weight': 600,
        // The transparency of a message
        opacity: 0.95,
    },
};
