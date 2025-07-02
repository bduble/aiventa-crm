import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { parseStringPromise } from 'xml2js';
import { Op } from 'sequelize';
import Lead from '../../models/Lead.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'adfIngest.log', maxsize: 1024 * 1024, maxFiles: 5 })
  ]
});

export function startAdfIngestJob() {
  const imap = new Imap({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: 993,
    tls: true
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', () => {
    openInbox(err => {
      if (err) {
        logger.error(`Failed to open inbox: ${err.stack}`);
        return;
      }
      logger.info('adfIngestJob connected and monitoring mailbox');
    });
  });

  imap.on('mail', fetchNewMessages);
  imap.on('error', err => logger.error(`IMAP error: ${err.stack}`));
  imap.on('end', () => logger.info('IMAP connection ended'));

  function fetchNewMessages() {
    imap.search(['UNSEEN', ['FROM', 'leads@yourdomain.com']], (err, results) => {
      if (err) {
        logger.error(`Search error: ${err.stack}`);
        return;
      }
      if (!results || !results.length) return;

      const f = imap.fetch(results, { bodies: '', markSeen: true });
      f.on('message', msg => {
        let buffer = '';
        msg.on('body', stream => {
          stream.on('data', chunk => { buffer += chunk.toString('utf8'); });
        });
        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(buffer);
            const attachments = (parsed.attachments || []).filter(a =>
              a.contentType === 'application/xml' || a.contentType === 'text/xml'
            );
            for (const att of attachments) {
              await processAttachment(att.content, att.filename);
            }
          } catch (e) {
            logger.error(`Message parse failed: ${e.stack}`);
          }
        });
      });
      f.once('error', err => logger.error(`Fetch error: ${err.stack}`));
    });
  }

  async function processAttachment(buffer, filename) {
    try {
      const xml = buffer.toString();
      const json = await parseStringPromise(xml, { explicitArray: false });
      const prospects = json?.adf?.prospect;
      if (!prospects) return;
      const prospectArray = Array.isArray(prospects) ? prospects : [prospects];
      for (const p of prospectArray) {
        const contact = p.customer?.contact || {};
        const firstName = contact.name?.first || '';
        const lastName = contact.name?.last || '';
        const email = contact.email || '';
        const phone = contact.phone || '';
        const vehicle = p.vehicle || {};
        const vehicleInterest = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
          .filter(Boolean).join(' ');
        const tradeVehicle = vehicle.trade || '';

        const leadInfo = { firstName, lastName, email, phone, vehicleInterest, tradeVehicle };
        if (await isDuplicate(leadInfo)) {
          logger.info(`Skipped duplicate lead ${email || phone}`);
          continue;
        }

        await Lead.create({
          name: `${firstName} ${lastName}`.trim(),
          source: 'adf',
          vehicle_interest: vehicleInterest,
          trade_vehicle: tradeVehicle,
          created_at: new Date()
        });
        logger.info(`Inserted lead ${firstName} ${lastName}`);
      }
    } catch (err) {
      logger.error(`Failed processing ${filename}: ${err.stack}`);
    }
  }

  async function isDuplicate(lead) {
    try {
      const possible = await Lead.findAll({
        where: {
          [Op.or]: [
            { email: lead.email },
            { lastName: lead.lastName },
            { phone: lead.phone }
          ]
        }
      });
      for (const rec of possible) {
        let matches = 0;
        if (rec.email && rec.email === lead.email) matches++;
        if (rec.lastName && rec.lastName === lead.lastName) matches++;
        if (rec.phone && rec.phone === lead.phone) matches++;
        if (matches >= 2) return true;
      }
      return false;
    } catch (err) {
      logger.error(`Duplicate check failed: ${err.stack}`);
      return false;
    }
  }

  imap.connect();
}
