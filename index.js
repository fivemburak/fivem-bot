const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Developer Portal'dan aldığın Token'ı iki tırnak arasına yapıştır
const BOT_TOKEN = 'MTU1NjIzMTE0NjEzNDcwNDE0OQ.GoTcDV.EnQcJI3NQv-yqV_VnAmEMpYb2NQLqDR0I_ik4k';
const KONTENJAN_LIMITI = 22;

let katilimcilar = [];

function ingamePaneliOlustur() {
    let katilimciListesi = katilimcilar.length > 0 
        ? katilimcilar.map((k, index) => `${index + 1}. <@${k.id}> \`${k.id}\``).join('\n')
        : 'Henüz kimse katılmadı.';

    const embed = new EmbedBuilder()
        .setTitle('REDZONE')
        .setColor('#1E1F22')
        .setDescription(
            `\`\`\`\n[ MAİN KADRO: ${katilimcilar.length} /${KONTENJAN_LIMITI} ]\n\`\`\`\n` +
            `**SÜRE:** 21 saat sonra\n\n` +
            `---\n\n` +
            `***Katılımcılar***\n\n` +
            `${katilimciListesi}`
        );

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_katil')
            .setLabel('Katıl')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('btn_ayril')
            .setLabel('Ayrıl')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('btn_bilgi')
            .setLabel('Bilgi')
            .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_iptal')
            .setLabel('İPTAL ET')
            .setEmoji('🔴')
            .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row1, row2] };
}

client.on('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı! Bot aktif.`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ingame') {
        katilimcilar = [];
        const panel = ingamePaneliOlustur();
        await message.channel.send(panel);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    const zatenKatildi = katilimcilar.some(k => k.id === userId);

    if (interaction.customId === 'btn_katil') {
        if (zatenKatildi) {
            return interaction.reply({ content: 'Zaten kadroda yer alıyorsunuz!', ephemeral: true });
        }
        if (katilimcilar.length >= KONTENJAN_LIMITI) {
            return interaction.reply({ content: 'Kadro dolmuştur!', ephemeral: true });
        }

        katilimcilar.push({ id: userId });
        await interaction.update(ingamePaneliOlustur());
    } 

    else if (interaction.customId === 'btn_ayril') {
        if (!zatenKatildi) {
            return interaction.reply({ content: 'Zaten kadroda değilsiniz!', ephemeral: true });
        }

        katilimcilar = katilimcilar.filter(k => k.id !== userId);
        await interaction.update(ingamePaneliOlustur());
    } 

    else if (interaction.customId === 'btn_bilgi') {
        await interaction.reply({ 
            content: `Mevcut durum: **${katilimcilar.length}/${KONTENJAN_LIMITI}** kullanıcı katıldı.`, 
            ephemeral: true 
        });
    } 

    else if (interaction.customId === 'btn_iptal') {
        katilimcilar = [];
        await interaction.update(ingamePaneliOlustur());
        await interaction.followUp({ content: 'Etkinlik ve liste iptal edildi/sıfırlandı.', ephemeral: true });
    }
});

client.login(BOT_TOKEN);