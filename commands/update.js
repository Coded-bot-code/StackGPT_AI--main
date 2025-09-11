// This plugin was created for GODSZEAL XMD Bot
// Don't Edit Or share without given me credits 

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try {
        await run('git --version');
        return true;
    } catch {
        return false;
    }
}

async function updateViaGit() {
    const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = (await run('git rev-parse origin/main')).trim();
    const alreadyUpToDate = oldRev === newRev;
    const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
    const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
    return { oldRev, newRev, alreadyUpToDate, commits, files };
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
            // Avoid infinite redirect loops
            if (visited.has(url) || visited.size > 5) {
                return reject(new Error('Too many redirects'));
            }
            visited.add(url);

            const useHttps = url.startsWith('https://');
            const client = useHttps ? require('https') : require('http');
            const req = client.get(url, {
                headers: {
                    'User-Agent': 'God-s-Zeal-Xmd-Updater/1.0',
                    'Accept': '*/*'
                }
            }, res => {
                // Handle redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`HTTP ${res.statusCode} without Location`));
                    const nextUrl = new URL(location, url).toString();
                    res.resume();
                    return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
                }

                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode}`));
                }

                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
                file.on('error', err => {
                    try { file.close(() => {}); } catch {}
                    fs.unlink(dest, () => reject(err));
                });
            });
            req.on('error', err => {
                fs.unlink(dest, () => reject(err));
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function extractZip(zipPath, outDir) {
    // Try to use platform tools; no extra npm modules required
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    // Linux/mac: try unzip, else 7z, else busybox unzip
    try {
        await run('command -v unzip');
        await run(`unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    try {
        await run('command -v 7z');
        await run(`7z x -y '${zipPath}' -o'${outDir}'`);
        return;
    } catch {}
    try {
        await run('busybox unzip -h');
        await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    throw new Error("No system unzip tool found (unzip/7z/busybox). Git mode is recommended on this panel.");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.copyFileSync(s, d);
            if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    const zipUrl = (zipOverride || 'https://github.com/AiOfLautech/God-s-Zeal-Xmd/archive/main.zip').trim();
    await sock.sendMessage(chatId, {
        text: `┌ ❏ *⌜ DOWNLOADING FILES ⌟* ❏
│
├◆ 📥 Fetching latest version...
├◆ 🔗 Source: GitHub Repository
├◆ ⏱️ Estimated time: 30-60 seconds
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

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);
    
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

    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    // Find the top-level extracted folder (GitHub zips create REPO-branch folder)
    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    // Copy over while preserving runtime dirs/files
    const ignore = ['node_modules', '.git', 'session', 'tmp', 'tmp/', 'temp', 'data', 'baileys_store.json', 'settings.js', 'app.json'];
    const copied = [];
    copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
    
    await sock.sendMessage(chatId, {
        text: `┌ ❏ *⌜ APPLYING CHANGES ⌟* ❏
│
├◆ 🔄 Replacing core files...
├◆ 🛡️ Skipping: settings.js, app.json
├◆ 💾 Updating system files
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

    // Cleanup extracted directory
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}
    return { copiedFiles: copied };
}

async function restartProcess(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            image: { url: "https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal40.jpeg" },
            caption: `┌ ❏ *⌜ UPDATE COMPLETE ⌟* ❏
│
├◆ ✅ *GODSZEAL XMD successfully updated!*
├◆ 🆕 New Version: Instant Deployment
├◆ ⚡ Bot will restart automatically
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
                    thumbnailUrl: "https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal40.jpeg",
                    mediaType: 1,
                    renderSmallerThumbnail: true,
                    showAdAttribution: true,
                    mediaUrl: "https://youtube.com/@Godszealtech",
                    sourceUrl: "https://youtube.com/@Godszealtech"
                }
            }
        }, { quoted: message });
    } catch {}
    
    try {
        // Preferred: PM2
        await run('pm2 restart all');
        return;
    } catch {}
    
    // Panels usually auto-restart when the process exits.
    // Exit after a short delay to allow the above message to flush.
    setTimeout(() => {
        process.exit(0);
    }, 3000);
}

async function updateCommand(sock, chatId, message, senderIsSudo, zipOverride) {
    try {
        await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ UPDATE INITIATED ⌟* ❏
│
├◆ 🚀 *Starting GODSZEAL XMD update...*
├◆ 🌐 Repository: AiOfLautech/God-s-Zeal-Xmd
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

        // Minimal UX
        if (await hasGitRepo()) {
            await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ GIT UPDATE MODE ⌟* ❏
│
├◆ 📦 Updating via Git repository...
├◆ 🔁 Fetching latest changes
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
            
            const { oldRev, newRev, alreadyUpToDate, commits, files } = await updateViaGit();
            
            if (alreadyUpToDate) {
                return await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ UPDATE STATUS ⌟* ❏
│
├◆ ✅ *GODSZEAL XMD is already up-to-date!*
├◆ 🆕 Latest Version: ${newRev.substring(0, 7)}
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
            
            await run('npm install --no-audit --no-fund');
        } else {
            await updateViaZip(sock, chatId, message, zipOverride);
        }
        
        await restartProcess(sock, chatId, message);
    } catch (err) {
        console.error('Update failed:', err);
        
        const errorBox = `┌ ❏ *⌜ UPDATE FAILED ⌟* ❏
│
├◆ ❌ *Critical Update Error!*
├◆ 📛 Error Code: UPD-500
├◆ 📝 Details: ${err.message.substring(0, 50)}...
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

module.exports = updateCommand;