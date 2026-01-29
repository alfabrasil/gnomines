import React, { useState, useEffect, useCallback } from 'react';
import { 
  Pickaxe, Zap, Coins, User, Bot, DollarSign, Clock, Lock, 
  ShoppingBag, LayoutDashboard, ArrowUpCircle, AlertTriangle,
  Lightbulb, X, Wallet, CheckSquare, Gift, ShieldAlert, 
  Dices, Star, Sparkles, Hammer, ZapOff, Trophy, Save, Activity,
  PieChart, TrendingUp, Briefcase, Award, Wrench, Newspaper,
  TrendingDown, ArrowUpRight, ArrowDownRight, Settings, Users,
  Volume2, VolumeX, LogOut, RefreshCw, Share2, HelpCircle, Moon,
  History, Copy, Network, Eye, Heart, Home
} from 'lucide-react';

// --- CONFIGURAÇÕES DO JOGO ---
const CONFIG = {
  CYCLE_HOURS: 6,
  MS_IN_HOUR: 3600000,
  XP_PER_GNO: 2,
  EXCHANGE_RATE: 100, // 1 USD = 100 GNO
  STARTING_GNO: 200, // Bônus do tutorial
  MAINTENANCE_COST_PCT: 0.10, 
  RETIREMENT_RETURN_PCT: 0.50,
  GEM_CHANCE_BASE: 0.0,
  SAVE_KEY: "GNOMINES_MVP_V4_FINAL" // Chave atualizada
};

// 1. TIPOS DE GNOMOS (Data Driven)
const GNOME_TYPES = {
  NOVICE: { id: 'novice', name: 'Gnomo Novato', cost: 100, bonus: 0.05, icon: '👶', desc: 'Aprendiz entusiasmado' },
  EXPERIENCED: { id: 'experienced', name: 'Gnomo Experiente', cost: 300, bonus: 0.15, icon: '👷', desc: 'Anos de experiência' },
  MASTER: { id: 'master', name: 'Gnomo Mestre', cost: 800, bonus: 0.30, icon: '🧙', desc: 'Lenda das minas' },
  SPECIALIST: { id: 'specialist', name: 'Gnomo Especialista', cost: 2000, bonus: 0.50, gemChance: 0.10, icon: '💎', desc: 'Foco em alto valor' },
  LEGENDARY: { id: 'legendary', name: 'Gnomo Lendário', cost: 5000, bonus: 1.00, gemChance: 0.20, icon: '👑', desc: 'Mito vivo' },
};

// 7. NÍVEIS DE PROFUNDIDADE
const DEPTH_LEVELS = [
  { level: 1, name: 'Superfície (0-100m)', prodMult: 1.0, gemMult: 0, cost: 0 },
  { level: 2, name: 'Subsolo (100-300m)', prodMult: 0.9, gemMult: 0.2, cost: 500 },
  { level: 3, name: 'Profundo (300-600m)', prodMult: 0.75, gemMult: 0.5, cost: 2000 },
  { level: 4, name: 'Abismo (600-1000m)', prodMult: 0.6, gemMult: 1.0, cost: 8000 },
  { level: 5, name: 'Núcleo (1000m+)', prodMult: 0.4, gemMult: 2.0, cost: 20000 },
];

const INITIAL_USER = {
  username: "Minerador",
  gnocripto: 0, 
  usdt: 0,
  energy: 100,
  maxEnergy: 100,
  xp: 0,
  level: 1,
  nextLevelXp: 1000,
  lifetimeEarnings: 0,
  totalSpent: 0,
  joinDate: new Date().toLocaleDateString(),
  guild: null,
  settings: { sound: true, music: true },
  tutorialStep: 0, 
  walletAddress: null,
  transactions: [],
  hasSeenTutorial: false,
  referralCode: "GNO-MK2-99",
  referralEarnings: 0,
  lastSaveTime: Date.now(),
  lastSpin: null // Data do último giro
};

// Inicializador de Minas
const createMine = (id, name, type, color, baseProd) => ({
  id, name, type, color, baseProduction: baseProd,
  lastCollected: new Date().toISOString(),
  automation: { active: false, expiresAt: null },
  equipments: [],
  durability: 100,
  depthLevel: 1,
  gnomes: [] 
});

const INITIAL_MINES = [
  createMine('1', 'Mina de Ouro', 'GOLD', 'bg-yellow-500', 10),
  createMine('2', 'Mina de Prata', 'SILVER', 'bg-gray-400', 6),
  createMine('3', 'Mina de Cobre', 'COPPER', 'bg-orange-600', 4),
  createMine('4', 'Mina de Ferro', 'IRON', 'bg-stone-500', 2),
  createMine('5', 'Mina de Carvão', 'COAL', 'bg-neutral-700', 1.5),
];

const PRICES = {
  ENERGY_PACK_SMALL: { cost: 50, amount: 20, currency: 'gnocripto', type: 'consumable' },
  COLLECTOR_GNOME: { cost: 5, currency: 'usdt', type: 'automation' },
  TITANIUM_PICKAXE: { id: 'pickaxe_t1', name: 'Picareta de Titânio', cost: 400, currency: 'gnocripto', type: 'equipment', bonusType: 'flat', bonusValue: 5, desc: '+5 Produção Base' },
  TURBO_DRILL: { id: 'drill_t1', name: 'Broca Turbo', cost: 10, currency: 'usdt', type: 'equipment', bonusType: 'multiplier', bonusValue: 0.2, desc: '+20% Produção Total' }
};

const LEADERBOARD_DATA = [
  { id: 1, name: "0x71...9A21", level: 45, xp: 950000, avatar: "bg-red-500" },
  { id: 2, name: "Whale_Eth", level: 32, xp: 620000, avatar: "bg-blue-500" },
  { id: 3, name: "GnomeLover", level: 28, xp: 410000, avatar: "bg-green-500" },
  { id: 4, name: "SatoshiFan", level: 15, xp: 150000, avatar: "bg-yellow-500" },
];

const GUILDS_DATA = [
  { id: 1, name: "Mineradores Unidos", members: 1240, desc: "A maior cooperativa." },
  { id: 2, name: "Gold Rush Clan", members: 850, desc: "Foco total em ouro." },
  { id: 3, name: "Gnomos da Montanha", members: 430, desc: "Estratégia e calma." },
];

const DAILY_MISSIONS = [
  { id: 1, text: "Colher 3 vezes", target: 3, progress: 0, reward: { type: 'energy', amount: 10 }, claimed: false },
  { id: 2, text: "Gastar 100 GnoCripto", target: 100, progress: 0, reward: { type: 'xp', amount: 500 }, claimed: false },
];

const WHEEL_PRIZES = [
  { id: 'energy_s', label: '+10 Energia', type: 'energy', amount: 10, chance: 0.4, color: 'text-blue-400' },
  { id: 'gno_s', label: '+50 GnoCripto', type: 'gnocripto', amount: 50, chance: 0.3, color: 'text-yellow-400' },
  { id: 'xp_m', label: '+300 XP', type: 'xp', amount: 300, chance: 0.2, color: 'text-purple-400' },
  { id: 'energy_l', label: '+50 Energia', type: 'energy', amount: 50, chance: 0.08, color: 'text-blue-300 font-bold' },
  { id: 'usdt_jackpot', label: '$1.00 USDT', type: 'usdt', amount: 1.0, chance: 0.02, color: 'text-green-400 font-black' },
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentTab, setCurrentTab] = useState('mines');
  const [user, setUser] = useState(INITIAL_USER);
  const [mines, setMines] = useState(INITIAL_MINES);
  const [missions, setMissions] = useState(DAILY_MISSIONS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Systems State
  const [marketTrends, setMarketTrends] = useState({ GOLD: 1.0, SILVER: 1.0, COPPER: 1.0, IRON: 1.0, COAL: 1.0 });
  const [marketNews, setMarketNews] = useState("Mercado estável.");
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [notification, setNotification] = useState(null);
  const [now, setNow] = useState(Date.now());
  
  // Modais
  const [targetMineSelection, setTargetMineSelection] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null }); 
  const [isSaving, setIsSaving] = useState(false);
  
  // Modais Específicos
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showGuildModal, setShowGuildModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [eventModal, setEventModal] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // --- CARREGAMENTO E SALVAMENTO ---
  useEffect(() => {
    const loadGame = () => {
      try {
        const savedData = localStorage.getItem(CONFIG.SAVE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.user) setUser(parsed.user);
          if (parsed.mines) setMines(parsed.mines);
          if (parsed.missions) setMissions(parsed.missions);
          
          if (parsed.user.walletAddress) {
             setIsAuthenticated(true);
             checkOfflineEarnings(parsed);
          }
        }
      } catch (e) {
        console.error("Erro load:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadGame();
  }, []);

  const checkOfflineEarnings = (parsed) => {
    const lastSave = parsed.user.lastSaveTime || Date.now();
    const diffHours = (Date.now() - lastSave) / CONFIG.MS_IN_HOUR;
    if (diffHours > 0.1) { 
      let totalOffline = 0;
      parsed.mines.forEach(mine => {
        if (mine.automation?.active && new Date(mine.automation.expiresAt) > new Date()) {
           let prod = mine.baseProduction * (mine.gnomes.length || 0); 
           if (mine.durability > 0 && prod > 0) totalOffline += prod * diffHours;
        }
      });
      if (totalOffline > 0) {
        setOfflineEarnings(totalOffline.toFixed(2));
        setShowOfflineModal(true);
        setUser(prev => ({ ...prev, gnocripto: prev.gnocripto + totalOffline, lifetimeEarnings: prev.lifetimeEarnings + totalOffline }));
      }
    }
  };

  useEffect(() => {
    if (!isLoaded || !isAuthenticated) return; 
    const saveGame = () => {
      setIsSaving(true);
      const dataToSave = { user: { ...user, lastSaveTime: Date.now() }, mines, missions };
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(dataToSave));
      setTimeout(() => setIsSaving(false), 800);
    };
    const saveInterval = setInterval(saveGame, 5000); 
    return () => clearInterval(saveInterval);
  }, [user, mines, missions, isLoaded, isAuthenticated]);

  // Timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (floatingTexts.length > 0) {
      const timer = setTimeout(() => setFloatingTexts(prev => prev.slice(1)));
      return () => clearTimeout(timer);
    }
  }, [floatingTexts]);

  // Simulação de Mercado
  useEffect(() => {
    const marketInterval = setInterval(() => {
      const types = ['GOLD', 'SILVER', 'COPPER', 'IRON', 'COAL'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const isBullMarket = Math.random() > 0.5; 
      const newMultiplier = isBullMarket ? 1.3 : 0.7; 
      const multiplierText = isBullMarket ? "+30%" : "-30%";
      const newsText = isBullMarket 
        ? `ALTA: ${randomType} disparou! (${multiplierText})`
        : `BAIXA: Correção no ${randomType}! (${multiplierText})`;
      const baseTrends = { GOLD: 1.0, SILVER: 1.0, COPPER: 1.0, IRON: 1.0, COAL: 1.0 };
      setMarketTrends({ ...baseTrends, [randomType]: newMultiplier });
      setMarketNews(newsText);
      if(isAuthenticated) showNotify('info', 'Mercado Atualizado!');
    }, 30000);
    return () => clearInterval(marketInterval);
  }, [isAuthenticated]);

  // --- LÓGICA DE PRODUÇÃO E NEGÓCIO ---
  const getGnomeEfficiency = (ageInMonths) => {
    if (ageInMonths <= 3) return 1.0; 
    if (ageInMonths >= 10) return 0.0; 
    const decay = (ageInMonths - 3) * 0.10; 
    return Math.max(0, 1.0 - decay);
  };

  const calculateMineProduction = useCallback((mine) => {
    if (mine.durability <= 0) return { production: 0, gemChance: 0 };

    let gemProbability = CONFIG.GEM_CHANCE_BASE;

    mine.gnomes.forEach(g => {
      const typeDef = Object.values(GNOME_TYPES).find(t => t.id === g.typeId);
      const efficiency = getGnomeEfficiency(g.ageMonths);
      if (typeDef.gemChance) gemProbability += (typeDef.gemChance * efficiency);
    });

    if (mine.gnomes.length === 0) return { production: 0, gemChance: 0 };

    const totalGnomePower = mine.gnomes.reduce((acc, g) => {
      const typeDef = Object.values(GNOME_TYPES).find(t => t.id === g.typeId);
      const eff = getGnomeEfficiency(g.ageMonths);
      return acc + (typeDef.bonus * eff); 
    }, 0);

    const depthInfo = DEPTH_LEVELS.find(d => d.level === mine.depthLevel);
    
    const equipFlat = mine.equipments.filter(e => e.bonusType === 'flat').reduce((acc,e) => acc + e.bonusValue, 0);
    const equipMult = mine.equipments.filter(e => e.bonusType === 'multiplier').reduce((acc,e) => acc + e.bonusValue, 0);

    let rawProd = (mine.baseProduction + equipFlat) * (totalGnomePower * 10) * (1 + equipMult); 
    rawProd *= depthInfo.prodMult;

    const trend = marketTrends[mine.type] || 1.0;
    rawProd *= trend;

    if (user.guild) rawProd *= 1.05;

    return {
      production: parseFloat(rawProd.toFixed(2)),
      gemChance: gemProbability * depthInfo.gemMult
    };
  }, [marketTrends, user.guild]);

  // --- ACTIONS ---
  const handleLogin = () => {
    setIsConnecting(true);
    setTimeout(() => {
      const mockAddress = "0x71C9...9A21";
      setUser(prev => ({ 
        ...prev, 
        walletAddress: mockAddress, 
        username: `Miner_${mockAddress.substring(0,6)}` 
      }));
      setIsAuthenticated(true);
      setIsConnecting(false);
      
      if (!user.hasSeenTutorial && user.tutorialStep === 0) {
        setTimeout(() => {
          setShowTutorial(true);
          setTutorialStep(1);
          setUser(u => ({ ...u, gnocripto: CONFIG.STARTING_GNO }));
        }, 800);
      }
    }, 2000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(prev => ({...prev, walletAddress: null}));
    localStorage.removeItem(CONFIG.SAVE_KEY); 
    setShowSettingsModal(false);
  };

  const handleHarvest = (mineId, e) => {
    const mine = mines.find(m => m.id === mineId);
    if (!mine) return;
    if (mine.durability <= 0) { showNotify('error', 'Mina colapsada!'); return; }

    const diffHours = (now - new Date(mine.lastCollected).getTime()) / CONFIG.MS_IN_HOUR;
    if (diffHours < CONFIG.CYCLE_HOURS && !mine.automation.active) { showNotify('info', 'Ainda produzindo...'); return; }

    const { production, gemChance } = calculateMineProduction(mine);
    const hoursCalculated = mine.automation.active ? diffHours : Math.min(diffHours, CONFIG.CYCLE_HOURS);
    let reward = production * hoursCalculated;
    
    let bonusGem = 0;
    if (Math.random() < gemChance) {
      bonusGem = 50 * mine.depthLevel; 
      showNotify('success', `💎 GEMA RARA! (+${bonusGem} GNO)`);
    }

    const operationCost = reward * 0.10; 
    const netProfit = (reward + bonusGem) - operationCost;

    if (netProfit > 0) {
      setUser(u => ({
        ...u, 
        gnocripto: u.gnocripto + netProfit,
        xp: u.xp + (netProfit * CONFIG.XP_PER_GNO),
        lifetimeEarnings: u.lifetimeEarnings + netProfit
      }));
      if (e) addFloatingText(e.clientX, e.clientY, `+${netProfit.toFixed(1)}`);
    }

    const updatedMines = mines.map(m => m.id === mineId ? {
      ...m,
      lastCollected: new Date().toISOString(),
      durability: Math.max(0, m.durability - 5) 
    } : m);
    setMines(updatedMines);

    const mineUpdated = updatedMines.find(m => m.id === mineId);
    if (mineUpdated.durability === 0) setEventModal({ type: 'bad', title: 'Colapso!', desc: `A estrutura da ${mine.name} cedeu.` });

    updateMissionProgress('harvest');
  };

  const handleRepair = (mineId) => {
    const mineIndex = mines.findIndex(m => m.id === mineId);
    if (user.gnocripto < CONFIG.REPAIR_COST_BASE) { showNotify('error', 'Saldo insuficiente!'); return; }
    const updatedMines = [...mines];
    updatedMines[mineIndex].durability = 100;
    setMines(updatedMines);
    setUser(prev => ({ ...prev, gnocripto: prev.gnocripto - CONFIG.REPAIR_COST_BASE, totalSpent: prev.totalSpent + CONFIG.REPAIR_COST_BASE }));
    showNotify('success', 'Mina reparada!');
    updateMissionProgress('spend', CONFIG.REPAIR_COST_BASE);
  };

  const buyGnome = (typeKey) => {
    const gnomeType = GNOME_TYPES[typeKey];
    if (user.gnocripto < gnomeType.cost) { showNotify('error', 'Saldo insuficiente'); return; }
    
    // Tutorial: Passo 3 -> 4
    if (user.tutorialStep === 3) {
      setUser(u => ({ ...u, tutorialStep: 4 }));
      setShowTutorial(false); // Fecha modal temporariamente
      setTimeout(() => {
        setModalState({ type: 'SELECT_MINE', data: { item: gnomeType, category: 'GNOME' } });
        // Reabre tutorial sobreposto em 200ms
        setTimeout(() => setShowTutorial(true), 200);
      }, 300);
    } else {
      setModalState({ type: 'SELECT_MINE', data: { item: gnomeType, category: 'GNOME' } });
    }
  };

  const executePurchase = (mineId, item, category) => {
    if (category === 'GNOME') {
      const newGnome = { instanceId: Date.now().toString(), typeId: item.id, ageMonths: 0, efficiency: 1.0 };
      setMines(prev => prev.map(m => m.id === mineId ? { ...m, gnomes: [...m.gnomes, newGnome] } : m));
      setUser(u => ({ ...u, gnocripto: u.gnocripto - item.cost, totalSpent: u.totalSpent + item.cost }));
      showNotify('success', `${item.name} contratado!`);
      
      // Tutorial: Passo 4 -> 5
      if (user.tutorialStep === 4) {
        setUser(u => ({ ...u, tutorialStep: 5 }));
        setShowTutorial(true);
      } else {
        setModalState(null);
      }
    }
  };

  const buyEnergy = () => { 
    const { cost, amount } = PRICES.ENERGY_PACK_SMALL; 
    if (user.gnocripto < cost) return showNotify('error', 'Saldo insuficiente!'); 
    setUser(prev => ({ ...prev, gnocripto: prev.gnocripto - cost, energy: Math.min(prev.energy + amount, prev.maxEnergy), totalSpent: prev.totalSpent + cost })); 
    showNotify('success', `+${amount} Energia!`); 
    updateMissionProgress('spend', cost); 
  };

  const confirmPurchaseForMine = (mineId) => { 
    if (!targetMineSelection) return; 
    const mineIndex = mines.findIndex(m => m.id === mineId); 
    const mine = mines[mineIndex]; 
    const updatedMines = [...mines]; 
    const item = targetMineSelection; 
    if (item.currency === 'gnocripto' && user.gnocripto < item.cost) return showNotify('error', 'GnoCripto insuficiente!'); 
    if (item.currency === 'usdt' && user.usdt < item.cost) return showNotify('error', 'USDT insuficiente!'); 
    
    if (item.type === 'worker') { updatedMines[mineIndex].gnomes += 1; showNotify('success', 'Gnomo contratado!'); } 
    else if (item.type === 'automation') { if (mine.automation.active) return showNotify('error', 'Já possui automação!'); updatedMines[mineIndex].automation = { active: true, expiresAt: new Date(Date.now() + 7 * 24 * MS_IN_HOUR).toISOString() }; showNotify('success', 'Automação ativa!'); } 
    else if (item.type === 'equipment') { updatedMines[mineIndex].equipments.push({ id: item.id, name: item.name, bonusType: item.bonusType, bonusValue: item.bonusValue }); showNotify('success', `${item.name} instalado!`); } 
    
    setUser(prev => ({ ...prev, [item.currency]: prev[item.currency] - item.cost, totalSpent: prev.totalSpent + (item.currency === 'gnocripto' ? item.cost : 0) })); 
    updateMissionProgress('spend', item.cost); 
    setMines(updatedMines); 
    setTargetMineSelection(null); 
  };

  // --- UTILS ---
  const addFloatingText = (x, y, text) => { setFloatingTexts(prev => [...prev, { id: Date.now(), x, y, text }]); };
  const showNotify = (type, msg) => setNotification({ type, msg });
  const joinGuild = (guild) => { setUser(prev => ({ ...prev, guild: guild })); setShowGuildModal(false); showNotify('success', `Bem-vindo à ${guild.name}!`); };
  const resetGame = () => { localStorage.removeItem(CONFIG.SAVE_KEY); setMines(INITIAL_MINES); setUser({...INITIAL_USER, hasSeenTutorial: false}); setMissions(DAILY_MISSIONS); setShowSettingsModal(false); setIsAuthenticated(false); showNotify('success', 'Resetado!'); };
  const updateMissionProgress = (type, amount = 1) => { setMissions(prev => prev.map(m => { if (m.claimed) return m; let newProgress = m.progress; if (m.id === 1 && type === 'harvest') newProgress += amount; if (m.id === 2 && type === 'spend') newProgress += amount; return { ...m, progress: Math.min(newProgress, m.target) }; })); };
  const claimMission = (id) => { const mission = missions.find(m => m.id === id); if (!mission || mission.progress < mission.target || mission.claimed) return; if (mission.reward.type === 'energy') setUser(prev => ({ ...prev, energy: Math.min(prev.energy + mission.reward.amount, prev.maxEnergy) })); else if (mission.reward.type === 'xp') setUser(prev => ({ ...prev, xp: prev.xp + mission.reward.amount })); setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m)); showNotify('success', 'Recompensa resgatada!'); };
  const handleUpgradeDepth = (mineId) => { const mine = mines.find(m => m.id === mineId); const nextLevel = DEPTH_LEVELS.find(d => d.level === mine.depthLevel + 1); if (!nextLevel) return; if (user.gnocripto < nextLevel.cost) { showNotify('error', `Precisa de ${nextLevel.cost} GNO`); return; } setUser(u => ({ ...u, gnocripto: u.gnocripto - nextLevel.cost })); setMines(prev => prev.map(m => m.id === mineId ? { ...m, depthLevel: nextLevel.level } : m)); showNotify('success', `Mina aprofundada!`); };
  
  const handleSpinWheel = () => { 
    if (isSpinning) return; 
    const lastSpinTime = user.lastSpin ? new Date(user.lastSpin).getTime() : 0;
    const timeSinceLastSpin = now - lastSpinTime;
    const COOLDOWN = 24 * CONFIG.MS_IN_HOUR;

    if (timeSinceLastSpin < COOLDOWN) {
        // Notification is handled by UI text logic
        return;
    }

    setIsSpinning(true); 
    setTimeout(() => { 
      const rand = Math.random(); 
      let cumulativeChance = 0; 
      let selectedPrize = WHEEL_PRIZES[0]; 
      for (let prize of WHEEL_PRIZES) { cumulativeChance += prize.chance; if (rand <= cumulativeChance) { selectedPrize = prize; break; } } 
      setUser(prev => { 
        const updates = { ...prev, lastSpin: new Date().toISOString() }; 
        if (selectedPrize.type === 'energy') updates.energy = Math.min(prev.energy + selectedPrize.amount, prev.maxEnergy); 
        if (selectedPrize.type === 'gnocripto') updates.gnocripto += selectedPrize.amount; 
        if (selectedPrize.type === 'xp') updates.xp += selectedPrize.amount; 
        if (selectedPrize.type === 'usdt') updates.usdt += selectedPrize.amount; 
        return updates; 
      }); 
      setIsSpinning(false); 
      setShowWheelModal(false); 
      setEventModal({ type: 'good', title: 'Sorte Grande!', desc: `Você ganhou: ${selectedPrize.label}` }); 
    }, 2000); 
  };
  
  const handleWalletTransaction = (type, amount, currency) => { if (type === 'deposit') { setUser(prev => ({ ...prev, [currency]: prev[currency] + amount, transactions: [{ type: 'DEPOSIT', amount, currency, date: new Date().toLocaleTimeString() }, ...(prev.transactions || [])] })); showNotify('success', `Depósito confirmado!`); } else { if (user[currency] < amount) return showNotify('error', 'Saldo insuficiente'); setUser(prev => ({ ...prev, [currency]: prev[currency] - amount, transactions: [{ type: 'WITHDRAW', amount, currency, date: new Date().toLocaleTimeString() }, ...(prev.transactions || [])] })); showNotify('success', `Saque realizado!`); } };

  // --- RENDERIZADORES ---

  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="z-10 text-center w-full max-w-sm">
        <div className="w-24 h-24 bg-yellow-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-yellow-500/30 rotate-12"><Pickaxe size={48} className="text-gray-900" /></div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">GnoMines <span className="text-yellow-500">2.0</span></h1>
        <p className="text-gray-400 mb-10 text-sm">Gerencie minas, contrate gnomes e lucre crypto.</p>
        <button onClick={handleLogin} disabled={isConnecting} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-gray-900 font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">{isConnecting ? <><RefreshCw className="animate-spin" /> Conectando...</> : <><Wallet /> Conectar Web3 Wallet</>}</button><p className="text-xs text-gray-600 mt-6 font-mono">Polygon Network (Simulado)</p></div></div>);

  const renderWalletModal = () => {
    if (!showWalletModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Wallet size={18}/> Minha Carteira</h3><button onClick={()=>setShowWalletModal(false)}><X className="text-gray-400" /></button></div>
          <div className="p-4 bg-gray-900 m-4 rounded-lg border border-gray-700"><p className="text-xs text-gray-500 mb-1">Endereço Conectado (Polygon)</p><p className="text-sm font-mono text-green-400 truncate">{user.walletAddress || "0x..."}</p></div>
          <div className="flex-1 overflow-y-auto px-4"><h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><History size={12}/> Histórico de Transações</h4>{(!user.transactions || user.transactions.length === 0) ? (<p className="text-gray-600 text-center text-xs py-4">Nenhuma transação recente.</p>) : (<div className="space-y-2">{user.transactions.map((tx, idx) => (<div key={idx} className="flex justify-between items-center bg-gray-700/30 p-2 rounded border border-gray-700/50"><div><p className={`text-xs font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'DEPOSIT' ? 'Entrada' : 'Saída'}</p><p className="text-[10px] text-gray-500">{tx.date}</p></div><p className="text-sm font-mono font-bold text-white">{tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount} {tx.currency}</p></div>))}</div>)}</div><div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl space-y-2"><div className="grid grid-cols-2 gap-2"><button onClick={() => handleWalletTransaction('deposit', 10, 'usdt')} className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><ArrowDownRight size={14}/> Depositar USDT</button><button onClick={() => handleWalletTransaction('withdraw', 10, 'usdt')} className="bg-red-600/20 text-red-400 border border-red-500 hover:bg-red-900/40 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><ArrowUpRight size={14}/> Sacar USDT</button></div></div></div></div>); };

  const renderNetworkModal = () => {
    if (!showNetworkModal) return null;
    const referralLink = `gnomines.game/ref/${user.walletAddress || '...'}`;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 flex flex-col max-h-[80vh]"><div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Network className="text-purple-400"/> Rede de Afiliados</h3><button onClick={() => setShowNetworkModal(false)}><X className="text-gray-400" /></button></div><div className="p-4 overflow-y-auto"><div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 mb-6"><p className="text-xs text-gray-400 mb-2 font-bold uppercase">Seu Link de Indicação (Web3)</p><div className="flex gap-2"><div className="bg-gray-900 flex-1 p-3 rounded border border-gray-700 text-xs font-mono text-center select-all text-purple-200 truncate">{referralLink}</div><button onClick={() => showNotify('success', 'Link copiado!')} className="bg-purple-600 hover:bg-purple-500 p-2 rounded text-white"><Copy size={16}/></button></div></div><div className="grid grid-cols-2 gap-3 mb-6"><div className="bg-gray-700/30 p-3 rounded-lg border border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold">Total Ganho</p><p className="text-xl font-bold text-green-400">0.00 GNO</p></div><div className="bg-gray-700/30 p-3 rounded-lg border border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold">Rede Ativa</p><p className="text-xl font-bold text-blue-400">0 Pessoas</p></div></div><h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center gap-2"><Award size={14}/> Estrutura de Ganhos (20%)</h4><div className="space-y-2">{[{ lvl: 1, pct: 10, color: "text-green-400", label: "Indicação Direta" }, { lvl: 2, pct: 4, color: "text-blue-400", label: "Nível 2" }, { lvl: 3, pct: 3, color: "text-yellow-400", label: "Nível 3" }, { lvl: 4, pct: 2, color: "text-orange-400", label: "Nível 4" }, { lvl: 5, pct: 1, color: "text-red-400", label: "Nível 5" }].map((tier) => (<div key={tier.lvl} className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800"><span className="text-xs text-gray-400 font-bold">Nível {tier.lvl}</span><span className="text-xs text-gray-500">{tier.label}</span><span className={`text-sm font-bold ${tier.color}`}>{tier.pct}%</span></div>))}</div></div></div></div>); };
  
  const renderRankingModal = () => { if (!showRankingModal) return null; const sortedLeaderboard = [...LEADERBOARD_DATA, { id: 99, name: user.username, level: user.level, xp: user.xp, avatar: "bg-gray-700", isUser: true }].sort((a, b) => b.xp - a.xp); return (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 flex flex-col max-h-[70vh]"><div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Trophy className="text-yellow-400"/> Ranking Global</h3><button onClick={() => setShowRankingModal(false)}><X className="text-gray-400" /></button></div><div className="p-4 overflow-y-auto">{sortedLeaderboard.map((player, index) => (<div key={player.id} className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${player.isUser ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-700/50 border-gray-700'}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 flex items-center justify-center font-bold rounded ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{index + 1}</div><div><p className={`font-bold text-sm ${player.isUser ? 'text-purple-300' : 'text-gray-200'}`}>{player.name}</p><p className="text-xs text-gray-400">Lvl {player.level}</p></div></div><div className="text-right"><p className="text-sm font-mono font-bold text-yellow-500">{player.xp.toLocaleString()} XP</p></div></div>))}</div></div></div>); };
  
  const renderGuildModal = () => { if (!showGuildModal) return null; return (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700"><div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Users className="text-blue-400"/> Guildas Abertas</h3><button onClick={() => setShowGuildModal(false)}><X className="text-gray-400" /></button></div><div className="p-4 space-y-3"><div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 mb-4 text-xs text-blue-200 text-center">Entre em uma guilda e ganhe <strong>+5% de Produção</strong> em todas as minas!</div>{GUILDS_DATA.map(guild => (<div key={guild.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center"><div><p className="font-bold text-gray-200">{guild.name}</p><p className="text-xs text-gray-500">{guild.members} Membros • {guild.desc}</p></div><button onClick={() => joinGuild(guild)} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold">Entrar</button></div>))}</div></div></div>); };
  
  const renderSettingsModal = () => { if (!showSettingsModal) return null; return (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700"><div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Settings className="text-gray-300"/> Configurações</h3><button onClick={() => setShowSettingsModal(false)}><X className="text-gray-400" /></button></div><div className="p-4 space-y-4"><div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg"><span className="text-gray-300 flex items-center gap-2">{user.settings.sound ? <Volume2 size={16}/> : <VolumeX size={16}/>} Efeitos Sonoros</span><button onClick={() => setUser(p => ({...p, settings: {...p.settings, sound: !p.settings.sound}}))} className={`w-10 h-6 rounded-full p-1 transition-colors ${user.settings.sound ? 'bg-green-500' : 'bg-gray-600'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${user.settings.sound ? 'translate-x-4' : 'translate-x-0'}`}></div></button></div><button onClick={() => { setShowSettingsModal(false); setShowTutorial(true); setTutorialStep(1); }} className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"><HelpCircle size={16}/> Ver Tutorial Novamente</button><div className="border-t border-gray-700 pt-4"><h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-1"><ShieldAlert size={12}/> Zona de Perigo</h4><button onClick={resetGame} className="w-full bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 text-red-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><RefreshCw size={16}/> RESETAR TODO PROGRESSO</button><p className="text-[10px] text-gray-500 mt-2 text-center">Isso apagará suas minas, gnomes e saldo. Usado para testes.</p></div></div></div></div>); };
  
  const renderWheelModal = () => {
    if (!showWheelModal) return null;
    const now = Date.now();
    const lastSpinTime = user.lastSpin ? new Date(user.lastSpin).getTime() : 0;
    const cooldownTime = 24 * CONFIG.MS_IN_HOUR;
    const timePassed = now - lastSpinTime;
    const canSpin = timePassed >= cooldownTime;
    
    let buttonText = 'GIRAR AGORA!';
    if (isSpinning) {
      buttonText = 'GIRANDO...';
    } else if (!canSpin) {
      const remaining = cooldownTime - timePassed;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      buttonText = `VOLTE EM ${hours}h ${minutes}m`;
    }

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 p-6 flex flex-col items-center">
          <div className="flex justify-between w-full mb-6">
            <h3 className="font-bold text-white flex gap-2"><Sparkles className="text-yellow-400"/> Roleta da Fortuna</h3>
            <button onClick={() => !isSpinning && setShowWheelModal(false)}><X className="text-gray-400" /></button>
          </div>
          
          <div className={`relative w-48 h-48 rounded-full border-4 border-yellow-600 bg-gray-900 flex items-center justify-center mb-8 shadow-2xl ${isSpinning ? 'animate-spin' : ''}`}>
             <Dices size={48} className="text-gray-600" />
             <div className="absolute top-0 w-2 h-4 bg-red-500 -mt-2"></div>
          </div>

          <button 
            onClick={handleSpinWheel}
            disabled={isSpinning || !canSpin}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all 
            ${(isSpinning || !canSpin) ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:scale-105 active:scale-95'}`}
          >
            {buttonText}
          </button>
          <p className="text-xs text-gray-500 mt-4 text-center">Tente a sorte e ganhe prêmios diários!</p>
        </div>
      </div>
    );
  };
  
  const renderEventModal = () => { if (!eventModal) return null; return (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><div className={`w-full max-w-xs p-6 rounded-2xl shadow-2xl border-2 text-center transform scale-100 animate-bounce ${eventModal.type === 'good' ? 'bg-gray-800 border-yellow-500' : 'bg-gray-800 border-red-500'}`}><div className="flex justify-center mb-4">{eventModal.type === 'good' ? <Gift size={48} className="text-yellow-400" /> : <ShieldAlert size={48} className="text-red-400" />}</div><h2 className={`text-xl font-bold mb-2 ${eventModal.type === 'good' ? 'text-yellow-400' : 'text-red-400'}`}>{eventModal.title}</h2><p className="text-gray-300 text-sm mb-6">{eventModal.desc}</p><button onClick={() => setEventModal(null)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-bold">OK</button></div></div>); };
  
  const renderMissionsModal = () => { if (!showMissionsModal) return null; return (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700"><div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><CheckSquare/> Missões Diárias</h3><button onClick={() => setShowMissionsModal(false)}><X className="text-gray-400" /></button></div><div className="p-4 space-y-3">{missions.map(m => { const isComplete = m.progress >= m.target; return (<div key={m.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-sm text-gray-200 font-bold">{m.text}</span><span className="text-xs text-blue-400 flex items-center gap-1"><Gift size={12}/> {m.reward.amount} {m.reward.type}</span></div><div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3"><div className="h-full bg-blue-500" style={{ width: `${(m.progress/m.target)*100}%` }}></div></div><button onClick={() => claimMission(m.id)} disabled={!isComplete || m.claimed} className={`w-full py-2 rounded text-xs font-bold uppercase ${m.claimed ? 'bg-gray-700 text-gray-500' : isComplete ? 'bg-green-600 text-white animate-pulse' : 'bg-gray-700 text-gray-400'}`}>{m.claimed ? 'Resgatado' : isComplete ? 'Resgatar Prêmio' : `${m.progress}/${m.target}`}</button></div>) })}</div></div></div>); };

  const renderTutorialModal = () => {
    const step = user.tutorialStep;
    const stepsContent = {
      1: { title: "Bem-vindo Minerador!", text: `Você recebeu ${CONFIG.STARTING_GNO} GNO para começar sua jornada.`, action: "Próximo" },
      2: { title: "Vamos às Compras", text: "Você precisa de força de trabalho. Vá até a LOJA.", action: "Ir para Loja", nav: 'store' },
      3: { title: "Contrate um Novato", text: "Clique no botão de COMPRA do Gnomo Novato (100 GNO).", action: "Vou Comprar" }, 
      4: { title: "Aloque seu Gnomo", text: "Selecione uma mina da lista abaixo para ele trabalhar.", blocking: false },
      5: { title: "Supervisão", text: "Volte para as MINAS e clique no ícone de OLHO para ver a simulação.", action: "Ir para Minas", nav: 'mines' },
      6: { title: "Lucro!", text: "Parabéns! Volte em 6 horas para colher seus lucros.", action: "Começar Jogo", end: true }
    };

    const content = stepsContent[step];
    if (!content) return null;
    const isNonBlocking = content.blocking === false;

    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 ${isNonBlocking ? 'pointer-events-none' : 'bg-black/80 backdrop-blur-md'}`}>
        <div className={`bg-gray-800 border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl ${isNonBlocking ? 'mt-[-300px] pointer-events-auto' : ''}`}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full text-xs">PASSO {step}/6</div>
          <h2 className="text-xl font-bold text-white mb-2 text-center">{content.title}</h2>
          <p className="text-gray-300 text-center mb-6">{content.text}</p>
          {content.action && (
            <button 
              onClick={() => {
                if (content.nav) setCurrentTab(content.nav);
                if (step === 3) { setModalState(null); } 
                else if (content.end) { setUser(u => ({ ...u, tutorialStep: 99 })); setModalState(null); } 
                else { setUser(u => ({ ...u, tutorialStep: u.tutorialStep + 1 })); setTimeout(() => setModalState({ type: 'TUTORIAL' }), 100); }
              }} 
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl"
            >
              {content.action}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSimulationModal = (mine) => {
    if (!mine) return null;
    const prodStats = calculateMineProduction(mine);
    
    // TUTORIAL FLOW: Passo 5 -> 6
    if (user.tutorialStep === 5) {
       setTimeout(() => {
         setUser(u => ({ ...u, tutorialStep: 6 }));
         setModalState({ type: 'TUTORIAL' }); 
       }, 800);
    }
    
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded ${mine.color}`}></div><h3 className="font-bold text-white">{mine.name} <span className="text-xs text-gray-400 font-normal">(Nvl {mine.depthLevel})</span></h3></div>
            <button onClick={() => setModalState(null)}><X className="text-gray-400"/></button>
          </div>
          <div className="h-48 bg-black relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rocky-wall.png')] opacity-20"></div>
            {mine.gnomes.length > 0 ? (
              <div className="flex flex-col items-center animate-bounce"><span className="text-6xl filter drop-shadow-lg">{GNOME_TYPES[Object.keys(GNOME_TYPES).find(k => GNOME_TYPES[k].id === mine.gnomes[0].typeId)]?.icon || '👷'}</span><div className="w-16 h-2 bg-black/50 rounded-full mt-2 relative overflow-hidden border border-gray-600"><div className="absolute top-0 left-0 h-full bg-green-500 w-2/3 animate-pulse"></div></div><span className="text-xs text-green-400 mt-1 font-mono">Minerando...</span></div>
            ) : (<p className="text-gray-500">Mina Vazia</p>)}
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded-xl border border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Produção Atual</p><p className="text-xl font-bold text-yellow-400 flex items-center gap-1"><Pickaxe size={16}/> {prodStats.production}/h</p></div>
              <div className="bg-gray-800 p-3 rounded-xl border border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Humor da Equipe</p><div className="flex items-center gap-1 text-green-400 font-bold"><Heart size={16} fill="currentColor"/> Feliz</div></div>
            </div>
            <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Energia da Mina</span> <span>{mine.durability}%</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${mine.durability > 50 ? 'bg-blue-500' : 'bg-red-500'}`} style={{width: `${mine.durability}%`}}></div></div></div>
            <div className="max-h-32 overflow-y-auto"><p className="text-xs text-gray-500 font-bold mb-2 uppercase">Trabalhadores ({mine.gnomes.length})</p>{mine.gnomes.map((g, i) => { const typeDef = Object.values(GNOME_TYPES).find(t => t.id === g.typeId); const eff = getGnomeEfficiency(g.ageMonths); return (<div key={i} className="flex justify-between items-center bg-gray-800 p-2 rounded mb-1 text-sm border border-gray-700"><span className="flex items-center gap-2">{typeDef.icon} {typeDef.name}</span><span className={`font-mono text-xs ${eff < 1 ? 'text-red-400' : 'text-green-400'}`}>Eficiência: {(eff*100).toFixed(0)}%</span></div>) })}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvice = () => {
    const brokenMine = mines.find(m => m.durability <= 0);
    if (brokenMine) return <div onClick={() => setCurrentTab('mines')} className="px-4 mt-4 cursor-pointer"><div className="rounded-lg p-3 flex items-start gap-3 bg-red-900/30 border border-red-500/50"><div className="p-2 rounded-full bg-red-500 text-white"><AlertTriangle size={16}/></div><div><h4 className="text-xs font-bold text-gray-300 uppercase">Urgente</h4><p className="text-sm font-medium text-gray-100">A {brokenMine.name} colapsou! Repare agora.</p></div></div></div>;
    const boomingMineType = Object.keys(marketTrends).find(k => marketTrends[k] > 1.0);
    if (boomingMineType) return <div onClick={() => setCurrentTab('mines')} className="px-4 mt-4 cursor-pointer"><div className="rounded-lg p-3 flex items-start gap-3 bg-yellow-900/30 border border-yellow-500/50"><div className="p-2 rounded-full bg-gray-800 text-gray-300"><TrendingUp size={16}/></div><div><h4 className="text-xs font-bold text-gray-300 uppercase">Mercado</h4><p className="text-sm font-medium text-gray-100">Alta em {boomingMineType}! Foque lá.</p></div></div></div>;
    if (user.energy < 10) return <div onClick={() => setCurrentTab('store')} className="px-4 mt-4 cursor-pointer"><div className="rounded-lg p-3 flex items-start gap-3 bg-red-900/30 border border-red-500/50"><div className="p-2 rounded-full bg-red-500 text-white"><AlertTriangle size={16}/></div><div><h4 className="text-xs font-bold text-gray-300 uppercase">Energia</h4><p className="text-sm font-medium text-gray-100">Energia crítica! Compre packs.</p></div></div></div>;
    return <div className="px-4 mt-4"><div className="rounded-lg p-3 flex items-start gap-3 bg-blue-900/30 border border-blue-500/50"><div className="p-2 rounded-full bg-gray-800 text-gray-300"><Lightbulb size={16}/></div><div><h4 className="text-xs font-bold text-gray-300 uppercase">Dica</h4><p className="text-sm font-medium text-gray-100">Minerar para subir de nível.</p></div></div></div>;
  };

  const renderOfflineModal = () => {
    if (!showOfflineModal) return null;
    return (
      <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
        <div className="bg-gray-800 w-full max-w-sm rounded-2xl border-2 border-green-500 p-6 shadow-2xl relative animate-bounce">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 p-4 rounded-full border-4 border-gray-900"><Moon size={32} className="text-white fill-current" /></div>
          <h2 className="text-2xl font-black text-white mt-6 text-center">BEM-VINDO DE VOLTA!</h2>
          <p className="text-gray-300 text-center text-sm mt-2 mb-6">Seus Gnomes Coletores trabalharam duro.</p>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center gap-2 mb-6"><span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Lucro Offline</span><div className="text-3xl font-black text-green-400 flex items-center gap-2"><Coins size={28}/> +{offlineEarnings}</div></div>
          <button onClick={() => setShowOfflineModal(false)} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/50 uppercase tracking-wide">Coletar Lucros</button>
        </div>
      </div>
    );
  };

  const renderMines = () => (
    <div className="space-y-4 pb-24 px-4 pt-4">
      {renderAdvice()}
      <h1 className="text-xl font-bold text-gray-100 mt-4">Minas Ativas</h1>
      {mines.map(mine => {
        const diffMs = now - new Date(mine.lastCollected).getTime();
        const cycleMs = CONFIG.CYCLE_HOURS * CONFIG.MS_IN_HOUR;
        const isReady = diffMs >= cycleMs;
        const isAuto = mine.automation.active;
        const isStopped = mine.gnomes.length === 0;
        const isBroken = mine.durability <= 0;
        
        let progress = Math.min((diffMs / cycleMs) * 100, 100);
        if (isAuto && isReady) progress = 100;
        const { production, gemChance } = calculateMineProduction(mine);
        const marketTrend = marketTrends[mine.type];
        const isBooming = marketTrend > 1.0;
        const isCrashing = marketTrend < 1.0;
        let durabilityColor = 'bg-blue-500';
        if (mine.durability < 30) durabilityColor = 'bg-red-500';
        else if (mine.durability < 60) durabilityColor = 'bg-yellow-500';

        return (
          <div key={mine.id} className={`relative bg-gray-800 rounded-xl p-4 border shadow-lg overflow-hidden ${isBroken ? 'border-red-500/50' : isBooming ? 'border-green-500/50 shadow-green-900/20' : isCrashing ? 'border-red-500/30' : 'border-gray-700'}`}>
            {isBroken && <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1"><AlertTriangle size={10} /> COLAPSO ESTRUTURAL</div>}
            {!isBroken && isBooming && <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1"><TrendingUp size={10} /> ALTA DE MERCADO</div>}
            {!isBroken && isCrashing && <div className="absolute top-0 right-0 bg-red-800 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1"><TrendingDown size={10} /> BAIXA DE MERCADO</div>}

            <div className="flex justify-between mb-2 mt-2">
              <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-lg ${mine.color} flex items-center justify-center`}>{isBroken ? <ZapOff size={24} className="text-gray-900" /> : <Pickaxe size={24} className="text-gray-900" />}</div>
                <div><h3 className="font-bold text-gray-100">{mine.name}</h3><div className="text-xs text-gray-400 flex items-center gap-1"><User size={10} /> {mine.gnomes.length} • <span className={`${isBooming ? 'text-green-400' : isCrashing ? 'text-red-400' : 'text-yellow-400'} font-bold ml-1 flex items-center gap-0.5`}>{production}/h {isBooming && <ArrowUpRight size={10}/>}{isCrashing && <ArrowDownRight size={10}/>}</span></div></div>
              </div>
              {isAuto && !isBroken && <div className="bg-purple-900/50 border border-purple-500/30 px-2 py-1 rounded text-xs font-bold text-purple-300 flex items-center gap-1"><Bot size={12} /> 7D</div>}
            </div>

            <div className="flex items-center gap-2 mb-3">
               <Wrench size={10} className="text-gray-500" /><div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden"><div className={`h-full ${durabilityColor} transition-all`} style={{ width: `${mine.durability}%` }}></div></div><span className={`text-[10px] font-mono ${mine.durability < 30 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>{mine.durability}%</span>
            </div>

            {mine.equipments.length > 0 && <div className="flex gap-1 mb-3 flex-wrap">{mine.equipments.map((eq, idx) => (<div key={idx} className="bg-gray-900 px-2 py-1 rounded border border-gray-600 text-[10px] text-blue-300 flex items-center gap-1"><Hammer size={8} /> {eq.name}</div>))}</div>}

            <div className="mb-4"><div className="h-2.5 bg-gray-900 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${isBroken ? 'bg-red-900' : isReady ? 'bg-green-500' : isAuto ? 'bg-purple-500' : 'bg-yellow-500'}`} style={{ width: isBroken ? '100%' : `${progress}%` }}></div></div></div>
            
            {isBroken ? (
               <button onClick={() => handleRepair(mine.id)} className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-lg shadow-red-900/50"><Wrench size={16} /> REPARAR (-{REPAIR_COST_BASE} Gno)</button>
            ) : (
               <button onClick={(e) => handleHarvest(mine.id, e)} disabled={isStopped || (!isReady && !isAuto)} className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${isStopped ? 'bg-gray-700 text-gray-500' : (isReady || isAuto) ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-[2px] active:shadow-none' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
                 {isStopped ? <><Lock size={16} /> PARADA</> : isAuto ? <><Bot size={16} /> AUTO</> : isReady ? <><Coins size={16} /> COLHER</> : <><Clock size={16} /> ...</>}
               </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStore = () => (
    <div className="pb-24 px-4 pt-4 space-y-6">
      <h1 className="text-xl font-bold text-gray-100 flex items-center justify-between">
        Loja de Gnomos 
        <span className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400 font-mono">1 USD = {CONFIG.EXCHANGE_RATE} GNO</span>
      </h1>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(GNOME_TYPES).map(([key, gnome]) => (
          <div key={key} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gray-700 px-2 py-1 rounded-bl text-[10px] text-gray-400 font-mono">~US$ {(gnome.cost / CONFIG.EXCHANGE_RATE).toFixed(2)}</div>
            <div className="flex items-center gap-4"><div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-3xl shadow-inner border border-gray-600">{gnome.icon}</div><div><h3 className="font-bold text-white text-lg">{gnome.name}</h3><p className="text-xs text-gray-400 italic mb-1">"{gnome.desc}"</p><div className="flex gap-2"><span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">+{gnome.bonus * 100}% Prod</span>{gnome.gemChance && <span className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">+{gnome.gemChance * 100}% Gemas</span>}</div></div></div>
            <button onClick={() => buyGnome(key)} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-3 rounded-xl font-bold flex flex-col items-center min-w-[80px] active:scale-95 transition-transform"><span className="text-xs text-yellow-200 opacity-80">Comprar</span><div className="flex items-center gap-1"><Coins size={14} className="text-white"/> {gnome.cost}</div></button>
          </div>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mt-4">
        <h3 className="font-bold text-gray-200 mb-3 text-sm uppercase">Essenciais</h3>
        <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-900/50 rounded text-blue-400"><Zap/></div><div><p className="font-bold text-sm">Pack Energia P</p><p className="text-xs text-gray-500">US$ 0.50</p></div></div><button onClick={buyEnergy} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm text-white">50 GNO</button></div>
        <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="p-2 bg-purple-900/50 rounded text-purple-400"><Bot/></div><div><p className="font-bold text-sm">Gnomo Coletor</p><p className="text-xs text-gray-500">US$ 5.00 / 7 dias</p></div></div><button onClick={() => setTargetMineSelection(PRICES.COLLECTOR_GNOME)} className="bg-purple-600 px-4 py-2 rounded-lg font-bold text-sm text-white">500 GNO</button></div>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Equipamentos</h3>
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-cyan-900/30 flex items-center justify-center text-cyan-400"><Hammer size={24} /></div><div><h3 className="font-bold text-gray-100">{PRICES.TITANIUM_PICKAXE.name}</h3><p className="text-xs text-gray-400">{PRICES.TITANIUM_PICKAXE.desc}</p></div></div>
          <button onClick={() => setTargetMineSelection(PRICES.TITANIUM_PICKAXE)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1"><Coins size={14} className="text-yellow-200" /> {PRICES.TITANIUM_PICKAXE.cost}</button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-red-900/30 flex items-center justify-center text-red-400"><ZapOff size={24} /></div><div><h3 className="font-bold text-gray-100">{PRICES.TURBO_DRILL.name}</h3><p className="text-xs text-gray-400">{PRICES.TURBO_DRILL.desc}</p></div></div>
          <button onClick={() => setTargetMineSelection(PRICES.TURBO_DRILL)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1"><DollarSign size={14} className="text-green-200" /> {PRICES.TURBO_DRILL.cost}</button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    const totalGnomes = mines.reduce((acc, m) => acc + m.gnomes.length, 0);
    const totalEquipments = mines.reduce((acc, m) => acc + m.equipments.length, 0);
    const bestMine = [...mines].sort((a,b) => calculateMineProduction(b).production - calculateMineProduction(a).production)[0];
    const bestMineProd = calculateMineProduction(bestMine).production;

    return (
      <div className="pb-24 px-4 pt-4 space-y-6">
        <h1 className="text-xl font-bold text-gray-100 mb-4">Perfil do Investidor</h1>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 flex flex-col items-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
             {user.guild && <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Users size={12}/> {user.guild.name}</span>}
          </div>
          <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-yellow-500 flex items-center justify-center mb-4"><User size={48} className="text-gray-300" /></div>
          <h2 className="text-2xl font-bold text-white">{user.username}</h2>
          <p className="text-purple-400 font-bold mb-1">Nível {user.level} (CEO)</p>
          <p className="text-gray-500 text-xs">Membro desde {user.joinDate}</p>
          
          <div className="flex gap-2 w-full mt-6">
             {!user.guild && <button onClick={() => setShowGuildModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Users size={16}/> Entrar Guilda</button>}
             <button onClick={() => setShowNetworkModal(true)} className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Network size={16}/> Minha Rede</button>
          </div>
          
          <button onClick={handleLogout} className="mt-4 text-xs text-red-400 flex items-center gap-1 hover:underline"><LogOut size={12}/> Desconectar Carteira</button>
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl mb-4">
           <div className="flex justify-between items-start mb-2">
             <h3 className="font-bold text-purple-300 flex items-center gap-2"><Share2 size={16}/> Sistema de Afiliados</h3>
             <span className="text-[10px] bg-purple-600 px-2 py-1 rounded text-white font-bold">GANHE 5%</span>
           </div>
           <p className="text-xs text-gray-400 mb-3">Compartilhe seu código e ganhe uma porcentagem da produção dos seus amigos.</p>
           <div className="flex gap-2">
             <div className="bg-gray-900 flex-1 p-2 rounded border border-gray-700 text-xs font-mono text-center select-all text-gray-300 truncate">
               {`gnomines.game/ref/${user.walletAddress}`}
             </div>
             <button onClick={() => showNotify('success', 'Link copiado para área de transferência!')} className="bg-purple-600 hover:bg-purple-500 px-4 rounded text-xs font-bold text-white"><Copy size={14}/></button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><PieChart size={16}/> <span className="text-xs font-bold uppercase">Total Minerado</span></div><p className="text-xl font-bold text-yellow-400">{user.lifetimeEarnings.toFixed(0)} Gno</p></div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><TrendingUp size={16}/> <span className="text-xs font-bold uppercase">Investimento</span></div><p className="text-xl font-bold text-red-400">-{user.totalSpent.toFixed(0)} Gno</p></div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><Briefcase size={16}/> <span className="text-xs font-bold uppercase">Força de Trabalho</span></div><p className="text-xl font-bold text-blue-400">{totalGnomes} Gnomes</p></div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><Award size={16}/> <span className="text-xs font-bold uppercase">Melhor Mina</span></div><p className="text-sm font-bold text-green-400">{bestMine.name}</p><p className="text-xs text-gray-500">{bestMineProd}/h</p></div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
           <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">Inventário de Ativos</h3>
           {totalEquipments === 0 ? <p className="text-gray-500 text-center text-sm py-4">Nenhum equipamento instalado.</p> : (
             <div className="space-y-2">{mines.map(m => m.equipments.length > 0 && (<div key={m.id} className="flex justify-between items-center text-sm"><span className="text-gray-300">{m.name}</span><div className="flex gap-1">{m.equipments.map((e, idx) => (<span key={idx} className="bg-gray-700 px-2 py-0.5 rounded text-xs text-cyan-300">{e.name}</span>))}</div></div>))}</div>
           )}
        </div>
      </div>
    );
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---
  if (!isAuthenticated) return renderLoginScreen();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col relative overflow-hidden">
      {/* Floating Texts Layer */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {floatingTexts.map(ft => (
          <div 
            key={ft.id} 
            className="absolute text-yellow-400 font-bold text-xl animate-[floatUp_1s_ease-out_forwards] drop-shadow-md"
            style={{ left: ft.x, top: ft.y }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-gray-800 p-4 pb-2 shadow-lg z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-yellow-500 flex items-center justify-center">
                <User size={20} className="text-gray-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-gray-800">
                {user.level}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                {user.username}
                {isSaving && <Activity size={12} className="text-green-400 animate-pulse" />}
              </h2>
              <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}/>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <button onClick={() => setShowSettingsModal(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-300"><Settings size={18} /></button>
             <button onClick={() => setShowRankingModal(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-yellow-400"><Trophy size={18} /></button>
             <button onClick={() => setShowWheelModal(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-purple-400"><Dices size={18} /></button>
             <button onClick={() => setShowMissionsModal(true)} className="relative p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-blue-400">
               <CheckSquare size={18} />
               {missions.some(m => m.progress >= m.target && !m.claimed) && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-gray-800"></span>}
             </button>
             <button onClick={() => setShowWalletModal(true)} className="p-1 rounded hover:bg-gray-700 text-right">
                <div className="flex items-center justify-end gap-1 text-yellow-400 font-bold text-lg"><Coins size={16} /><span>{user.gnocripto.toFixed(0)}</span></div>
                <div className="flex items-center justify-end gap-1 text-green-400 text-xs"><DollarSign size={12} /><span>{user.usdt.toFixed(2)}</span></div>
             </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-2 flex items-center justify-between gap-2 border border-gray-700 mb-2">
           <div className="flex items-center gap-2 overflow-hidden">
             <Newspaper size={14} className="text-blue-400 flex-shrink-0" />
             <span className="text-xs text-gray-300 whitespace-nowrap animate-pulse">{marketNews}</span>
           </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-2 flex items-center gap-2">
          <Zap size={14} className="text-blue-400" />
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all" style={{ width: `${(user.energy / user.maxEnergy) * 100}%` }}></div></div>
          <span className="text-xs font-mono text-blue-300 w-12 text-right">{user.energy}/{user.maxEnergy}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentTab === 'store' && renderStore()}
        {currentTab === 'mines' && renderMines()}
        {currentTab === 'profile' && renderProfile()}
      </div>
      
      {/* Footer Nav */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex justify-around pb-6">
        <button onClick={() => setCurrentTab('mines')} className={`flex flex-col items-center ${currentTab === 'mines' ? 'text-yellow-500' : 'text-gray-500'}`}><Home size={24}/> <span className="text-[10px] font-bold">Minas</span></button>
        <button onClick={() => setCurrentTab('store')} className={`flex flex-col items-center ${currentTab === 'store' ? 'text-yellow-500' : 'text-gray-500'}`}><ShoppingBag size={24}/> <span className="text-[10px] font-bold">Loja</span></button>
        <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center ${currentTab === 'profile' ? 'text-yellow-500' : 'text-gray-500'}`}><User size={24}/> <span className="text-[10px] font-bold">Perfil</span></button>
      </div>

      {modalState?.type === 'TUTORIAL' && renderTutorialModal()}
      {modalState?.type === 'SIMULATION' && renderSimulationModal(modalState.data)}
      {modalState?.type === 'SELECT_MINE' && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6">
          <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-600 p-4 relative">
            <h3 className="text-white font-bold mb-4">Onde alocar {modalState.data.item.name}?</h3>
            {user.tutorialStep === 4 && (
               <div className="absolute -top-16 left-0 right-0 bg-yellow-500 text-black p-2 rounded text-center font-bold animate-bounce z-50">
                 👆 Escolha uma mina para o Gnomo!
                 <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-yellow-500"></div>
               </div>
            )}
            {mines.map(m => (
              <button key={m.id} onClick={() => executePurchase(m.id, modalState.data.item, modalState.data.category)} className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg mb-2 text-left flex justify-between items-center border border-gray-600">
                <div className="flex items-center gap-2"><div className={`w-4 h-4 rounded ${m.color}`}></div><span className="text-white">{m.name}</span></div>
                <span className="text-xs text-gray-400">{m.gnomes.length} gnomos</span>
              </button>
            ))}
            <button onClick={() => setModalState(null)} className="w-full mt-2 text-red-400 text-sm">Cancelar</button>
          </div>
        </div>
      )}
      {showRankingModal && renderRankingModal()}
      {showSettingsModal && renderSettingsModal()}
      {showGuildModal && renderGuildModal()}
      {showNetworkModal && renderNetworkModal()}
      {showWalletModal && renderWalletModal()}
      {showMissionsModal && renderMissionsModal()}
      {showWheelModal && renderWheelModal()}
      {showOfflineModal && renderOfflineModal()}
      {eventModal && renderEventModal()}
      {showLevelUp && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 pointer-events-none"><div className="bg-purple-600 px-8 py-6 rounded-xl animate-bounce text-center border-4 border-yellow-400"><h2 className="text-3xl font-black">LEVEL UP!</h2></div></div>}
      
      {notification && <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[100] font-bold text-sm animate-bounce ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{notification.msg}</div>}
      
      {/* CSS para Floating Text */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}