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
            text: `â”Œ â *âŒœ CHECKING UPDATES âŒŸ* â
â”‚
â”œâ—† ðŸ” Scanning for GODSZEAL XMD updates...
â”œâ—† ðŸŒ Repository: AiOfLautech/God-s-Zeal-Xmd
â”” â`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: 'â¦ â•â•â•â• â€¢âŠ°â‚ GODSZEAL XMD  â‚âŠ±â€¢ â•â•â•â• â¦',
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
                text: `â”Œ â *âŒœ UPDATE STATUS âŒŸ* â
â”‚
â”œâ—† âœ… *GODSZEAL XMD is already up-to-date!*
â”œâ—† ðŸ†• Latest Version: ${latestCommitHash.substring(0, 7)}
â”œâ—† â±ï¸ Last checked: ${new Date().toLocaleString()}
â”” â`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    mentionedJid: [message.key.remoteJid],
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363269950668068@newsletter',
                        newsletterName: 'â¦ â•â•â•â• â€¢âŠ°â‚ GODSZEAL XMD  â‚âŠ±â€¢ â•â•â•â• â¦',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Step 2: Start update process
        await sock.sendMessage(chatId, {
            text: `â”Œ â *âŒœ UPDATE INITIATED âŒŸ* â
â”‚
â”œâ—† ðŸš€ *Starting GODSZEAL XMD update...*
â”œâ—† ðŸ“¦ Downloading latest version (v${latestCommitHash.substring(0, 7)})
â”œâ—† â³ This may take 1-2 minutes
â”” â`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: 'â¦ â•â•â•â• â€¢âŠ°â‚ GODSZEAL XMD  â‚âŠ±â€¢ â•â•â•â• â¦',
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
            text: `â”Œ â *âŒœ EXTRACTING FILES âŒŸ* â
â”‚
â”œâ—† ðŸ“¦ Unpacking update package...
â”œâ—† ðŸ”‘ Preserving your config files
â”œâ—† ðŸ—‚ï¸ Structure: God-s-Zeal-Xmd-main/
â”” â`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: 'â¦ â•â•â•â• â€¢âŠ°â‚ GODSZEAL XMD  â‚âŠ±â€¢ â•â•â•â• â¦',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Copy updated files
        await sock.sendMessage(chatId, {
            text: `â”Œ â *âŒœ APPLYING CHANGES âŒŸ* â
â”‚
â”œâ—† ðŸ”„ Replacing core files...
â”œâ—† ðŸ›¡ï¸ Skipping: settings.js, app.json
â”œâ—† ðŸ’¾ Saving new commit hash: ${latestCommitHash.substring(0, 7)}
â”” â`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: 'â¦ â•â•â•â• â€¢âŠ°â‚ GODSZEAL XMD  â‚âŠ±â€¢ â•â•â•â• â¦',
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
            image: { url: "https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal40.jpeg" },
            caption: `â”Œ â *âŒœ UPDATE COMPLETE âŒŸ* â
â”‚
â”œâ—† âœ… *GODSZEAL XMD successfully updated!*
â”œâ—† ðŸ†• New Version: ${latestCommitHash.substring(0, 7)}
â”œâ—† âš¡ *Restarting bot in 5 seconds...*
â”‚
â”œâ—† *WHAT'S NEW:*
â”œâ—† â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â”œâ—† ðŸŒŸ 100+ commands
â”œâ—† ðŸ› ï¸ Enhanced performance
â”œâ—† ðŸž Critical bug fixes
â”‚
â”œâ—† âœ¨ *Thank you for using GODSZEAL XMD!*
â”” â
â€Ž
${'='.repeat(30)}
âš¡ *Godszeal is working hard for you!*
ðŸ’¡ *Type .help for command list*
${'='.repeat(30)}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: 'â¦ â•â•â•â• â€¢âŠ°â‚ GODSZEAL XMD  â‚âŠ±â€¢ â•â•â•â• â¦',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: 'GODSZEAL XMD Bot',
                    body: 'Created with Godszeal Tech',
                    thumbnailUrl: "https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal40.jpeg",
                    mediaType: 1,
                    renderSmallerThumbnail: true,
                    showAdAttribution: true,
                    mediaUrl: "https://youtube.com/@Godszealtecg",
                    sourceUrl: "https://youtube.com/@Godszealtech"
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

        // ðŸ”‘ CRITICAL FIX: Guaranteed restart mechanism
        await new Promise(resolve => setTimeout(resolve, 2000)); // Ensure message delivery
        
        // Create restart script in temp directory
        const restartScript = `
const { exec } = require('child_process');
const path = require('path');
const indexJs = path.join(__dirname, '../index.js');

// Wait for resources to free up
setTimeout(() => {
  console.log('ðŸ”„ Restarting GODSZEAL XMD bot...');
  exec('node "${path.join(__dirname, '../index.js')}"', {
    cwd: '${path.join(__dirname, '..')}',
    detached: true,
    stdio: 'inherit'
  }, (error) => {
    if (error) {
      console.error('Restart failed:', error);
      process.exit(1);
    }
    console.log('âœ… Bot restarted successfully');
    process.exit(0);
  });
}, 5000);
        `;
        
        const restartScriptPath = path.join(os.tmpdir(), `godszeal_restart_${Date.now()}.js`);
        fs.writeFileSync(restartScriptPath, restartScript);
        
        // Execute restart script
        exec(`node "${restartScriptPath}"`, {
            detached: true,
            stdio: 'ignore'
        });
        
        // Final delay before exit
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Shutting down for update...");
        process.exit(0);

    } catch (error) {
        console.error('Update Command Error:', error);
        
        const errorBox = `â”Œ â *âŒœ UPDATE FAILED âŒŸ* â
â”‚
â”œâ—† âŒ *Critical Update Error!*
â”œâ—† ðŸ“› Error Code: UPD-500
â”œâ—† ðŸ“ Details: ${error.message.substring(0, 50)}...
â”‚
â”œâ—† *SOLUTION:*
â”œâ—† â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â”œâ—† 1. Check internet connection
â”œâ—† 2. Verify GitHub access
â”œâ—† 3. Contact developer
â”” â`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: 'âŒ', key: message.key }
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
            console.log(`âš ï¸ Skipping ${item} - preserving custom settings`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            try {
                fs.copyFileSync(srcPath, destPath);
            } catch (err) {
                console.log(`âš ï¸ Failed to copy ${item}, skipping:`, err.message);
            }
        }
    }
}

module.exports = updateCommand;
