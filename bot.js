const { Client } = require('discord.js-selfbot-v11'),
    client = new Client();

const { prompt } = require('enquirer')
var colors = require('colors')

async function run() {

    await logAscii()
    process.title = '9M CLONER by sharkzin'

    const config = await prompt([{
            type: 'input',
            name: 'token',
            message: 'Insira o token da sua conta'
        }, {
            type: 'input',
            name: 'original',
            message: 'Insira o ID do servidor que deseja copiar'
        },
        {
            type: 'input',
            name: 'target',
            message: 'Insira o ID do servidor para colar a copia'
        }
    ])
    const { token, original, target } = config

    client.on('ready', async() => {
        logAscii()
        const guilds = [await client.guilds.get(original), await client.guilds.get(target)]
        guilds.forEach(g => {
            if (!g) {
                log('Servidor desconhecido, verifique os ID', 3)
                process.exit(1)
            }
        })

        let itens = {
            text: guilds[0].channels.filter(c => c.type === 'text').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            voice: guilds[0].channels.filter(c => c.type === 'voice').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            category: guilds[0].channels.filter(c => c.type === 'category').sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
            roles: guilds[0].roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).map(r => r)
        }
        process.title = `9M Clonando: ${guilds[0].name}`;

        log('Excluindo todos os canais e funções do servidor atual...', 3)
        await guilds[1].channels.forEach(c => c.delete().catch(() => {}))
        await guilds[1].roles.map(r => r.delete().catch((() => {})))

        await guilds[1].setIcon(guilds[0].iconURL)
        await guilds[1].setName(`${guilds[0].name} 9M Cloner`)

        for (let role of itens.roles) {
            if (guilds[1].roles.get(role.id)) continue;

            guilds[1].createRole({
                name: role.name,
                type: role.type,
                color: role.color,
                permissions: role.permissions,
                managed: role.managed,
                mentionable: role.mentionable,
                position: role.position
            }).then(r => log(`Criando Cargo: ${r.name}`, 1))
        }

        await guilds[0].emojis.forEach(e => {
            if (guilds[1].emojis.get(e.id)) return;

            guilds[1].createEmoji(e.url, e.name).then(c => log(`Criando emoji: ${c}`, 1));
        })

        itens['category'].forEach(async(category) => {
            if (guilds[1].channels.get(category.id)) return;

            await guilds[1].createChannel(category.name, {
                type: 'category',
                permissionOverwrites: category.permissionOverwrites.map(v => {
                    let target = guilds[0].roles.get(v.id);
                    if (!target) return;
                    return {
                        id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                        allow: v.allow || 0,
                        deny: v.deny || 0,
                    };
                }).filter(v => v),
                position: category.position
            }).then(c => {
                log(`Criando categoria: ${c.name}`, 1)
            })
        })

        for (let channel of itens.text) {
            if (guilds[1].channels.get(channel.id)) continue;

            if (!channel.parent) {
                if (channel.topic) await guilds[1].createChannel(channel.name, {
                    type: 'text',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position
                }).then(c => c.setTopic(channel.topic))
            } else {
                let chn = await guilds[1].createChannel(channel.name, {
                    type: 'text',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position
                })
                if (channel.topic) chn.setTopic(channel.topic);

                if (guilds[1].channels.find(c => c.name == channel.parent.name)) chn.setParent(guilds[1].channels.find(c => c.name == channel.parent.name).id);
                else {
                    var cat = await guilds[1].createChannel(channel.parent.name, {
                        type: 'category',
                        permissionOverwrites: channel.permissionOverwrites.map(v => {
                            let target = guilds[0].roles.get(v.id);
                            if (!target) return;
                            return {
                                id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                                allow: v.allow || 0,
                                deny: v.deny || 0,
                            };
                        }).filter(v => v),
                        position: channel.position
                    });
                    chn.setParent(cat);
                }
            }
            log(`Criando canal de texto: ${channel.name}`, 1)
        }

        for (let channel of itens.voice) {
            if (guilds[1].channels.get(channel.id)) continue;

            if (!channel.parent) {
                if (channel.topic) await guilds[1].createChannel(channel.name, {
                    type: 'voice',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position,
                    userLimit: channel.userLimit
                })
            } else {
                let chn = await guilds[1].createChannel(channel.name, {
                    type: 'voice',
                    permissionOverwrites: channel.permissionOverwrites.map(v => {
                        let target = guilds[0].roles.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                            allow: v.allow || 0,
                            deny: v.deny || 0,
                        };
                    }).filter(v => v),
                    position: channel.position,
                    userLimit: channel.userLimit
                })

                if (guilds[1].channels.find(c => c.name == channel.parent.name)) chn.setParent(guilds[1].channels.find(c => c.name == channel.parent.name).id);
                else {
                    var cat = await guilds[1].createChannel(channel.parent.name, {
                        type: 'category',
                        permissionOverwrites: channel.permissionOverwrites.map(v => {
                            let target = guilds[0].roles.get(v.id);
                            if (!target) return;
                            return {
                                id: guilds[1].roles.find(r => r.name == target.name) || guilds[1].id,
                                allow: v.allow || 0,
                                deny: v.deny || 0,
                            };
                        }).filter(v => v),
                        position: channel.position,
                    });
                    chn.setParent(cat);
                }
            }
            log(`Criando canal de voz: ${channel.name}`, 1)
        }
    })

    client.login(`${token}`.replace(/"/g, ''))
        .catch(() => {
            logAscii()
            log('Algo está errado, verifique o token', 3)
        })
}

async function logAscii() {
    console.clear()
    console.log(`
//.............................................................................................................
//...999999..9MMMMM...MMMMMM........CCCCCCC....LLLL.........OOOOOOO.....NNNN...NNNN..EEEEEEEEEEE.RRRRRRRRRR....
//..99999999.9MMMMM...MMMMMM.......CCCCCCCCC...LLLL........OOOOOOOOOO...NNNNN..NNNN..EEEEEEEEEEE.RRRRRRRRRRR...
//.9999.9999.9MMMMM...MMMMMM......CCCCCCCCCCC..LLLL.......OOOOOOOOOOOO..NNNNN..NNNN..EEEEEEEEEEE.RRRRRRRRRRR...
//.9999..99999MMMMMM.MMMMMMM......CCCC...CCCCC.LLLL.......OOOOO..OOOOO..NNNNNN.NNNN..EEEE........RRRR...RRRRR..
//.9999..99999MMMMMM.MMMMMMM..... CCC.....CCC..LLLL......OOOOO....OOOOO.NNNNNN.NNNN..EEEE........RRRR...RRRRR..
//.9999..99999MMMMMM.MMMMMMM..... CCC..........LLLL......OOOO......OOOO.NNNNNNNNNNN..EEEEEEEEEE..RRRRRRRRRRR...
//.99999999999MMMMMMMMMMMMMM..... CCC..........LLLL......OOOO......OOOO.NNNNNNNNNNN..EEEEEEEEEE..RRRRRRRRRRR...
//..9999999999MMMMMMMMMMMMMM..... CCC..........LLLL......OOOO......OOOO.NNNNNNNNNNN..EEEEEEEEEE..RRRRRRRR......
//...999999999MMMMMMMMMMMMMM..... CCC.....CCC..LLLL......OOOOO....OOOOO.NNNNNNNNNNN..EEEE........RRRR.RRRR.....
//.......99999MMM.MMMMM.MMMM......CCCC...CCCCC.LLLL.......OOOOO..OOOOO..NNNN.NNNNNN..EEEE........RRRR..RRRR....
//.9999.9999.9MMM.MMMMM.MMMM......CCCCCCCCCCC..LLLLLLLLLL.OOOOOOOOOOOO..NNNN..NNNNN..EEEEEEEEEEE.RRRR..RRRRR...
//..99999999.9MMM.MMMMM.MMMM.......CCCCCCCCCC..LLLLLLLLLL..OOOOOOOOOO...NNNN..NNNNN..EEEEEEEEEEE.RRRR...RRRRR..
//...99999...9MMM.MMMMM.MMMM........CCCCCCC....LLLLLLLLLL....OOOOOO.....NNNN...NNNN..EEEEEEEEEEE.RRRR....RRRR..
//.............................................................................................................                                                                                                                                                                                      
                             
`.brightCyan)
}

async function log(message, type) {
    switch (type) {
        case 1:
            await console.log(` [!] ${message}`.brightGreen)
            break;
        case 2:
            await console.log(` [\u26A0] ${message}`.yellow)
            break;
        case 3:
            await console.log(` [X] ${message}`.red)
            break;
    }
}

run()