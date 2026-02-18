const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Village = require('./models/Village');
const Issue = require('./models/Issue');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Village.deleteMany();
        await Issue.deleteMany();

        const tnVillagesData = [
            { district: "Ariyalur", villages: ["Ariyalur", "Sendurai", "Udayarpalayam", "Andimadam", "Jayankondam"] },
            { district: "Chengalpattu", villages: ["Chengalpattu", "Maduranthakam", "Tambaram", "Pallavaram", "Vandalur"] },
            { district: "Chennai", villages: ["Teynampet", "Mylapore", "Adyar", "Velachery", "Anna Nagar"] },
            { district: "Coimbatore", villages: ["Pollachi", "Mettupalayam", "Sulur", "Valparai", "Annur"] },
            { district: "Cuddalore", villages: ["Chidambaram", "Panruti", "Neyveli", "Vriddhachalam", "Kattumannarkoil"] },
            { district: "Dharmapuri", villages: ["Dharmapuri", "Harur", "Pappireddipatti", "Pennagaram", "Palacode"] },
            { district: "Dindigul", villages: ["Palani", "Kodaikanal", "Nilakottai", "Oddanchatram", "Vedasandur"] },
            { district: "Erode", villages: ["Bhavani", "Gobichettipalayam", "Perundurai", "Sathyamangalam", "Anthiyur"] },
            { district: "Kallakurichi", villages: ["Kallakurichi", "Sankarapuram", "Tirukkoyilur", "Ulundurpet", "Chinnasalem"] },
            { district: "Kancheepuram", villages: ["Kanchipuram", "Sriperumbudur", "Walajabad", "Kundrathur", "Uthiramerur"] },
            { district: "Kanniyakumari", villages: ["Nagercoil", "Thuckalay", "Kuzhithurai", "Colachel", "Padmanabhapuram"] },
            { district: "Karur", villages: ["Karur", "Kulithalai", "Aravakurichi", "Krishnarayapuram", "Kadavur"] },
            { district: "Krishnagiri", villages: ["Hosur", "Krishnagiri", "Denkanikottai", "Pochampalli", "Uthangarai"] },
            { district: "Madurai", villages: ["Thirumangalam", "Usilampatti", "Melur", "Vadipatti", "Sholavandan"] },
            { district: "Mayiladuthurai", villages: ["Mayiladuthurai", "Sirkazhi", "Tharangambadi", "Kuthalam"] },
            { district: "Nagapattinam", villages: ["Nagapattinam", "Kilvelur", "Thalaignayiru", "Vedaranyam"] },
            { district: "Namakkal", villages: ["Namakkal", "Tiruchengode", "Rasipuram", "Paramathi Velur", "Kolli Hills"] },
            { district: "Nilgiris", villages: ["Ooty", "Coonoor", "Gudalur", "Kotagiri", "Kundah"] },
            { district: "Perambalur", villages: ["Perambalur", "Veppanthattai", "Kunnam", "Alathur"] },
            { district: "Pudukkottai", villages: ["Pudukkottai", "Aranthangi", "Iluppur", "Keeranur", "Alangudi"] },
            { district: "Ramanathapuram", villages: ["Ramanathapuram", "Paramakudi", "Rameswaram", "Tiruvadanai", "Mudukulathur"] },
            { district: "Ranipet", villages: ["Ranipet", "Arcot", "Walajah", "Arakkonam", "Sholinghur"] },
            { district: "Salem", villages: ["Attur", "Mettur", "Omalur", "Sankari", "Edappadi"] },
            { district: "Sivaganga", villages: ["Sivaganga", "Karaikudi", "Devakottai", "Manamadurai", "Kalayarkoil"] },
            { district: "Tenkasi", villages: ["Tenkasi", "Sankarankovil", "Kadayanallur", "Alangulam", "Pavoorchatram"] },
            { district: "Thanjavur", villages: ["Thanjavur", "Kumbakonam", "Pattukkottai", "Orathanadu", "Thiruvaiyaru"] },
            { district: "Theni", villages: ["Theni", "Periyakulam", "Bodinayakanur", "Cumbum", "Uthamapalayam"] },
            { district: "Thoothukudi", villages: ["Thoothukudi", "Kovilpatti", "Tiruchendur", "Sathankulam", "Vilathikulam"] },
            { district: "Tiruchirappalli", villages: ["Manapparai", "Musiri", "Thuraiyur", "Lalgudi", "Srirangam"] },
            { district: "Tirunelveli", villages: ["Palayamkottai", "Ambasamudram", "Nanguneri", "Radhapuram", "Valliyur"] },
            { district: "Tirupathur", villages: ["Tirupathur", "Vaniyambadi", "Ambur", "Natrampalli"] },
            { district: "Tiruppur", villages: ["Avinashi", "Dharapuram", "Kangeyam", "Udumalaipettai", "Palladam"] },
            { district: "Tiruvallur", villages: ["Avadi", "Ponneri", "Gummidipoondi", "Tiruttani", "Poonamallee"] },
            { district: "Tiruvannamalai", villages: ["Arani", "Cheyyar", "Polur", "Vandavasi", "Chengam"] },
            { district: "Tiruvarur", villages: ["Tiruvarur", "Mannargudi", "Thiruthuraipoondi", "Nannilam", "Needamangalam"] },
            { district: "Vellore", villages: ["Vellore", "Katpadi", "Gudiyatham", "Pernambut", "Anaicut"] },
            { district: "Viluppuram", villages: ["Viluppuram", "Tindivanam", "Gingee", "Vikravandi", "Marakkanam"] },
            { district: "Virudhunagar", villages: ["Virudhunagar", "Sivakasi", "Rajapalayam", "Aruppukkottai", "Sattur"] }
        ];

        const villages = [];
        for (const item of tnVillagesData) {
            for (const vName of item.villages) {
                villages.push({
                    name: vName,
                    district: item.district,
                    state: "Tamil Nadu",
                    wards: ["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"]
                });
            }
        }

        const createdVillages = await Village.insertMany(villages);
        const ariyalur = createdVillages.find(v => v.name === "Ariyalur");
        const chennai = createdVillages.find(v => v.name === "Mylapore");

        const usersData = [
            {
                name: 'Admin User',
                mobile: '9999999999',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin',
                village: ariyalur._id,
                villageName: ariyalur.name,
            },
            {
                name: 'Village Coordinator',
                mobile: '8888888888',
                email: 'coordinator@example.com',
                password: 'password123',
                role: 'Coordinator',
                village: ariyalur._id,
                villageName: ariyalur.name,
            },
            {
                name: 'Villager User',
                mobile: '7777777777',
                email: 'villager@example.com',
                password: 'password123',
                role: 'Villager',
                village: ariyalur._id,
                villageName: ariyalur.name,
                ward: 'Ward 1',
            },
        ];

        const createdUsers = await User.create(usersData);
        const villager = createdUsers.find(u => u.role === 'Villager');
        const admin = createdUsers.find(u => u.role === 'Admin');

        const issuesData = [
            {
                title: "Broken Water Pipe in Ariyalur",
                description: "Leaking pipe near the main temple causing water wastage.",
                category: "Water",
                village: ariyalur._id,
                villageName: ariyalur.name,
                reportedBy: villager._id,
                status: "Submitted",
                priority: "High"
            },
            {
                title: "Streetlight Not Working",
                description: "The streetlights in Ward 1 are dark for 3 days.",
                category: "Electricity",
                village: ariyalur._id,
                villageName: ariyalur.name,
                reportedBy: villager._id,
                status: "In Progress",
                priority: "Medium"
            },
            {
                title: "Potholes on Main Road",
                description: "Deep potholes making it dangerous for bikes.",
                category: "Roads",
                village: chennai._id,
                villageName: "Mylapore",
                reportedBy: admin._id,
                status: "Submitted",
                priority: "Medium"
            }
        ];

        await Issue.create(issuesData);

        console.log(`Data Imported! ${createdVillages.length} villages, ${createdUsers.length} users, and ${issuesData.length} issues seeded.`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
