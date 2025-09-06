// This plugin was created for GODSZEAL XMD Bot
// Don't Edit Or share without given me credits 

const axios = require('axios');
const fs = require('fs');
const path = require("path");
const os = require('os');
const AdmZip = require("adm-zip");
const { exec } = require('child_process');

// Temporary storage helper for commit hash
const TEMP_FILE = path.join(os.tmpdir(), 'godszeal_update.hash');

function getCommitHash() {
    try {
        return fs.existsSync(TEMP_FILE) ? fs.readFileSync(TEMP_FILE, 'utf8') : null;
    } catch (error) {
        console.error('Temp file read error:', error);
        return null;
    }
}

function setCommitHash(hash) {
    try {
        fs.writeFileSync(TEMP_FILE, hash);
    } catch (error) {
        console.error('Temp file write error:', error);
    }
}

async function updateCommand(sock, chatId, message) {
    try {
        // Step 1: Check for updates
        await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ CHECKING UPDATES ⌟* ❏
│
├◆ 🔍 Scanning for GODSZEAL XMD updates...
├◆ 🌐 Repository: AiOfLautech/God-s-Zeal-Xmd
└ ❏`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        // Fetch latest commit hash
        const response = await axios.get(
            "https://api.github.com/repos/AiOfLautech/God-s-Zeal-Xmd/commits/main"
        );
        const latestCommitHash = response.data.sha;
        const currentHash = getCommitHash();

        if (latestCommitHash === currentHash) {
            return sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ UPDATE STATUS ⌟* ❏
│
├◆ ✅ *GODSZEAL XMD is already up-to-date!*
├◆ 🆕 Latest Version: ${latestCommitHash.substring(0, 7)}
├◆ ⏱️ Last checked: ${new Date().toLocaleString()}
└ ❏`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    mentionedJid: [message.key.remoteJid],
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363269950668068@newsletter',
                        newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Step 2: Start update process
        await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ UPDATE INITIATED ⌟* ❏
│
├◆ 🚀 *Starting GODSZEAL XMD update...*
├◆ 📦 Downloading latest version (v${latestCommitHash.substring(0, 7)})
├◆ ⏳ This may take 1-2 minutes
└ ❏`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        // Download latest code (FIXED)
        const zipPath = path.join(__dirname, "latest.zip");
        const zipResponse = await axios.get(
            "https://github.com/AiOfLautech/God-s-Zeal-Xmd/archive/main.zip", 
            { responseType: "arraybuffer" }
        );
        fs.writeFileSync(zipPath, zipResponse.data);

        // Extract ZIP
        await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ EXTRACTING FILES ⌟* ❏
│
├◆ 📦 Unpacking update package...
├◆ 🔑 Preserving your config files
├◆ 🗂️ Structure: God-s-Zeal-Xmd-main/
└ ❏`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Copy updated files
        await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ APPLYING CHANGES ⌟* ❏
│
├◆ 🔄 Replacing core files...
├◆ 🛡️ Skipping: settings.js, app.json
├◆ 💾 Saving new commit hash: ${latestCommitHash.substring(0, 7)}
└ ❏`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        const sourcePath = path.join(extractPath, "God-s-Zeal-Xmd-main");
        const destinationPath = path.join(__dirname, '..');
        copyFolderSync(sourcePath, destinationPath);
        setCommitHash(latestCommitHash);

        // Final success message - SEND BEFORE CLEANUP/RESTART
        await sock.sendMessage(chatId, {
            image: { url: "https://i.ibb.co/4jT4hRJ/godszeal-alive.jpg" },
            caption: `┌ ❏ *⌜ UPDATE COMPLETE ⌟* ❏
│
├◆ ✅ *GODSZEAL XMD successfully updated!*
├◆ 🆕 New Version: ${latestCommitHash.substring(0, 7)}
├◆ ⚡ Preparing for graceful restart...
│
├◆ *WHAT'S NEW:*
├◆ ────────────────────
├◆ 🌟 2500+ commands
├◆ 🛠️ Enhanced performance
├◆ 🐞 Critical bug fixes
│
├◆ ✨ *Thank you for using GODSZEAL XMD!*
└ ❏
‎
${'='.repeat(30)}
⚡ *Godszeal is working hard for you!*
💡 *Type .help for command list*
${'='.repeat(30)}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: 'GODSZEAL XMD Bot',
                    body: 'Created with Godszeal Tech',
                    thumbnailUrl: "https://i.ibb.co/4jT4hRJ/godszeal-alive.jpg",
                    mediaType: 1,
                    renderSmallerThumbnail: true,
                    showAdAttribution: true,
                    mediaUrl: "https://youtube.com/@luckytechhub-iu7sm",
                    sourceUrl: "https://youtube.com/@luckytechhub-iu7sm"
                }
            }
        }, { quoted: message });

        // CLEANUP - Do this AFTER sending success message
        try {
            fs.unlinkSync(zipPath);
        } catch (e) {
            console.log('Cleanup: Zip file locked, will clean later');
        }
        
        try {
            fs.rmSync(extractPath, { recursive: true, force: true });
        } catch (e) {
            console.log('Cleanup: Extract folder locked, will clean later');
        }

        // GRACEFUL RESTART - Critical Fix
        await new Promise(resolve => setTimeout(resolve, 2000)); // Ensure message delivery
        
        // Use child process to restart without immediate termination
        exec('node ' + path.join(__dirname, '../index.js'), {
            cwd: path.join(__dirname, '..'),
            detached: true,
            stdio: 'inherit'
        });
        
        // Terminate current process AFTER new instance starts
        setTimeout(() => {
            console.log("Shutting down old process after update");
            process.exit(0);
        }, 5000);

    } catch (error) {
        console.error('Update Command Error:', error);
        
        const errorBox = `┌ ❏ *⌜ UPDATE FAILED ⌟* ❏
│
├◆ ❌ *Critical Update Error!*
├◆ 📛 Error Code: UPD-500
├◆ 📝 Details: ${error.message.substring(0, 50)}...
│
├◆ *SOLUTION:*
├◆ ────────────────────
├◆ 1. Check internet connection
├◆ 2. Verify GitHub access
├◆ 3. Contact developer
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        }, { quoted: message });
    }
}

// Helper function to copy directories while preserving config files
function copyFolderSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        // Preserve critical config files
        if (item === "settings.js" || item === "app.json") {
            console.log(`⚠️ Skipping ${item} - preserving custom settings`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            try {
                fs.copyFileSync(srcPath, destPath);
            } catch (err) {
                console.log(`⚠️ Failed to copy ${item}, skipping:`, err.message);
            }
        }
    }
}

module.exports = updateCommand;
