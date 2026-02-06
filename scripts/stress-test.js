import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const ROOM_NAME = 'stress-test-room';
const TOTAL_CLIENTS = 50; // Adjust as needed
const RAMP_UP_INTERVAL = 100; // ms between connections

console.log(`Starting stress test with ${TOTAL_CLIENTS} clients connecting to room: ${ROOM_NAME}`);

let connectedCount = 0;
let messageCount = 0;
const clients = [];

async function createClientConnection(index) {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    const channel = client.channel(`canvas-${ROOM_NAME}`);

    channel
        .on('broadcast', { event: 'stress-ping' }, (payload) => {
            messageCount++;
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                connectedCount++;
                process.stdout.write(`\rConnected: ${connectedCount}/${TOTAL_CLIENTS}`);

                // Simulate activity
                setInterval(() => {
                    if (Math.random() > 0.9) {
                        channel.send({
                            type: 'broadcast',
                            event: 'stress-ping',
                            payload: { from: `client-${index}`, timestamp: Date.now() }
                        })
                    }
                }, 5000);

            } else {
                console.log(`\nClient ${index} status: ${status}`);
            }
        });

    clients.push(client);
}

async function run() {
    for (let i = 0; i < TOTAL_CLIENTS; i++) {
        createClientConnection(i);
        await new Promise(resolve => setTimeout(resolve, RAMP_UP_INTERVAL));
    }

    console.log('\nAll clients initiated. Monitoring for 30 seconds...');

    setTimeout(() => {
        console.log(`\nResults:`);
        console.log(`- Connected Clients: ${connectedCount}/${TOTAL_CLIENTS}`);
        console.log(`- Messages Received: ${messageCount}`);
        console.log(`- Connection Success Rate: ${((connectedCount / TOTAL_CLIENTS) * 100).toFixed(2)}%`);
        process.exit(0);
    }, 30000);
}

run();
