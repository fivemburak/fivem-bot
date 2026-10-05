const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const MAX_MAIN = 22;
const MAX_YEDEK = 5;

let participants = [];

function createInGameEmbed() {
    const mainList = participants.slice(0, MAX_MAIN);
    const yedekList = participants.slice(MAX_MAIN, MAX_MAIN + MAX_YEDEK);

    let contentText = "";

    if (mainList.length > 0) {
        contentText += mainList.map((user, index) => `**${index + 1}.** <@${user.id}> \`${user.id}\``).join('\n');
    } else {
        contentText += "*Henüz kimse katılmadı.*";
    }

    if (yedekList.length > 0) {
        contentText += "\n\n***Yedek Kadro***\n";
        contentText += yedekList.map((user, index) => `**${index + 1}.** <@${user.id}> \`${user.id}\``).join('\n');
    }

    const embed = new EmbedBuilder()
        .setTitle('REDZONE')
        .setDescription(
            `\`\`\`\n[ MAİN KADRO: ${mainList.length} /${MAX_MAIN} ]\n\`\`\`\n` +
            `**SÜRE:** Otomatik Etkinlik\n\n` +
            `---\n\n` +
            `***Katılımcılar***\n\n` +
            `${contentText}`
        )
        .setColor(0x2B2D31);

    return embed;
}

function createButtons() {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ingame_katil').setLabel('Katıl').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('ingame_ayril').setLabel('Ayrıl').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ingame_bilgi').setLabel('Bilgi').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ingame_iptal').setLabel('🛑 İPTAL ET').setStyle(ButtonStyle.Secondary)
    );

    return [row1, row2];
}

client.on('ready', () => {
    console.log(`Bot ${client.user.tag} olarak aktif!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ingame') {
        participants = [];
        await message.channel.send({
            embeds: [createInGameEmbed()],
            components: createButtons()
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    const isAlreadyJoined = participants.some(u => u.id === userId);

    if (interaction.customId === 'ingame_katil') {
        if (isAlreadyJoined) {
            return interaction.reply({ content: 'Zaten katılım listesindesin!', ephemeral: true });
        }

        if (participants.length >= MAX_MAIN + MAX_YEDEK) {
            return interaction.reply({ content: 'Ana kadro ve yedek kadro tamamen doldu!', ephemeral: true });
        }

        participants.push(interaction.user);

        try {
            await interaction.user.send('İNGAME KATILDIN. SAATİNDE SES VE OYUNDA OL');
        } catch (err) {
            console.log(`${interaction.user.tag} kullanıcısının DM'i kapalı.`);
        }

        const isYedek = participants.length > MAX_MAIN;
        const durum = isYedek ? 'Yedek Kadroya eklendin.' : 'Ana Kadroya eklendin.';

        await interaction.update({
            embeds: [createInGameEmbed()],
            components: createButtons()
        });

        await interaction.followUp({ content: `Başarıyla katıldın! (${durum}) DM kutunu kontrol et.`, ephemeral: true });
    }

    if (interaction.customId === 'ingame_ayril') {
        if (!isAlreadyJoined) {
            return interaction.reply({ content: 'Zaten listede değilsin.', ephemeral: true });
        }

        participants = participants.filter(u => u.id !== userId);

        await interaction.update({
            embeds: [createInGameEmbed()],
            components: createButtons()
        });

        await interaction.followUp({ content: 'Listeden ayrıldın.', ephemeral: true });
    }

    if (interaction.customId === 'ingame_bilgi') {
        await interaction.reply({
            content: `**Etkinlik Bilgisi:**\n- Ana Kadro: ${MAX_MAIN} Kişi\n- Maksimum Yedek: ${MAX_YEDEK} Kişi\n- Katılan herkesin etkinlik saatinde seste olması zorunludur.`,
            ephemeral: true
        });
    }

    if (interaction.customId === 'ingame_iptal') {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'Etkinliği sadece yöneticiler iptal edebilir!', ephemeral: true });
        }

        participants = [];
        await interaction.update({
            embeds: [createInGameEmbed()],
            components: createButtons()
        });
        await interaction.followUp({ content: 'Etkinlik katılımı sıfırlandı.', ephemeral: true });
    }
});

client.login(process.env.BOT_TOKEN || MTU1NjIzMTE0NjEzNDcwNDE0OQ.GypBRp.SnzKgwK6uIsfGVjAZRGc7gk97nyo4zdDz2elCU);

 
