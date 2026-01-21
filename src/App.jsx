import React, { useState, useEffect } from 'react';
import { 
  Pickaxe, Zap, Coins, User, Bot, DollarSign, Clock, Lock, 
  ShoppingBag, LayoutDashboard, ArrowUpCircle, AlertTriangle,
  Lightbulb, X, Wallet, CheckSquare, Gift, ShieldAlert, 
  Dices, Star, Sparkles, Hammer, ZapOff, Trophy, Save, Activity,
  PieChart, TrendingUp, Briefcase, Award, Wrench, Newspaper,
  TrendingDown, ArrowUpRight, ArrowDownRight, Settings, Users,
  Volume2, VolumeX, LogOut, RefreshCw, Share2, HelpCircle, Moon,
  History, Copy, Network
} from 'lucide-react';

// --- CONFIGURAÇÕES DO JOGO ---
const CYCLE_HOURS = 6;
const MS_IN_HOUR = 3600000;
const XP_PER_GNOCRIPTO = 2; 
const DURABILITY_LOSS_PER_HARVEST = 10; 
const REPAIR_COST_BASE = 50; 
const SAVE_KEY = "GNOMINES_MVP_EXPO_V1"; 

// ITENS DA LOJA
const PRICES = {
  ENERGY_PACK_SMALL: { cost: 50, amount: 20, currency: 'gnocripto', type: 'consumable' },
  WORKER_GNOME: { cost: 200, currency: 'gnocripto', type: 'worker' },
  COLLECTOR_GNOME: { cost: 5, currency: 'usdt', type: 'automation' },
  TITANIUM_PICKAXE: { 
    id: 'pickaxe_t1', name: 'Picareta de Titânio', cost: 400, currency: 'gnocripto', 
    type: 'equipment', bonusType: 'flat', bonusValue: 5, desc: '+5 Produção Base'
  },
  TURBO_DRILL: { 
    id: 'drill_t1', name: 'Broca Turbo', cost: 10, currency: 'usdt', 
    type: 'equipment', bonusType: 'multiplier', bonusValue: 0.2, desc: '+20% Produção Total'
  }
};

// ESTADO INICIAL
const INITIAL_USER = {
  username: "Minerador",
  gnocripto: 1500.00, 
  usdt: 25.00,
  energy: 85,
  maxEnergy: 100,
  xp: 0,
  level: 1,
  nextLevelXp: 1000,
  lastSpin: null,
  lifetimeEarnings: 0,
  totalSpent: 0,
  joinDate: new Date().toLocaleDateString(),
  guild: null,
  settings: { sound: true, music: true },
  hasSeenTutorial: false,
  referralEarnings: 0,
  lastSaveTime: Date.now(),
  walletAddress: null, 
  transactions: [] 
};

// DADOS MOCKADOS
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

const INITIAL_MINES = [
  {
    id: '1', name: 'Mina de Ouro', type: 'GOLD', color: 'bg-yellow-500', gnomes: 1, baseProduction: 10,
    lastCollected: new Date(Date.now() - 7 * MS_IN_HOUR).toISOString(),
    automation: { active: false, expiresAt: null }, equipments: [], durability: 100
  },
  {
    id: '2', name: 'Mina de Prata', type: 'SILVER', color: 'bg-gray-400', gnomes: 0, baseProduction: 6,
    lastCollected: new Date(Date.now() - 4 * MS_IN_HOUR).toISOString(),
    automation: { active: false, expiresAt: null }, equipments: [], durability: 100
  },
  {
    id: '3', name: 'Mina de Cobre', type: 'COPPER', color: 'bg-orange-600', gnomes: 0, baseProduction: 4,
    lastCollected: new Date(Date.now() - 2 * MS_IN_HOUR).toISOString(),
    automation: { active: false, expiresAt: null }, equipments: [], durability: 100
  },
  {
    id: '4', name: 'Mina de Ferro', type: 'IRON', color: 'bg-stone-500', gnomes: 0, baseProduction: 2,
    lastCollected: new Date().toISOString(), automation: { active: false, expiresAt: null }, equipments: [], durability: 100
  },
  {
    id: '5', name: 'Mina de Carvão', type: 'COAL', color: 'bg-neutral-700', gnomes: 0, baseProduction: 1.5,
    lastCollected: new Date(Date.now() - 0.1 * MS_IN_HOUR).toISOString(), automation: { active: false, expiresAt: null }, equipments: [], durability: 100
  },
];

const WHEEL_PRIZES = [
  { id: 'energy_s', label: '+10 Energia', type: 'energy', amount: 10, chance: 0.4, color: 'text-blue-400' },
  { id: 'gno_s', label: '+50 GnoCripto', type: 'gnocripto', amount: 50, chance: 0.3, color: 'text-yellow-400' },
  { id: 'xp_m', label: '+300 XP', type: 'xp', amount: 300, chance: 0.2, color: 'text-purple-400' },
  { id: 'energy_l', label: '+50 Energia', type: 'energy', amount: 50, chance: 0.08, color: 'text-blue-300 font-bold' },
  { id: 'usdt_jackpot', label: '$1.00 USDT', type: 'usdt', amount: 1.0, chance: 0.02, color: 'text-green-400 font-black' },
];

export default function App() {
  // ESTADOS GERAIS
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentTab, setCurrentTab] = useState('mines');
  
  // DADOS DO JOGO
  const [mines, setMines] = useState(INITIAL_MINES);
  const [user, setUser] = useState(INITIAL_USER);
  const [missions, setMissions] = useState(DAILY_MISSIONS);
  
  // UTILS & VISUALS
  const [now, setNow] = useState(Date.now());
  const [notification, setNotification] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  
  // MODAIS
  const [targetMineSelection, setTargetMineSelection] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGuildModal, setShowGuildModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [eventModal, setEventModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // MERCADO
  const [marketTrends, setMarketTrends] = useState({
    GOLD: 1.0, SILVER: 1.0, COPPER: 1.0, IRON: 1.0, COAL: 1.0
  });
  const [marketNews, setMarketNews] = useState("Conectando ao oráculo de preços...");

  // --- CICLO DE VIDA: CARREGAMENTO ---
  useEffect(() => {
    const loadGame = () => {
      try {
        const savedData = localStorage.getItem(SAVE_KEY);
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
        console.error("Erro ao carregar save:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadGame();
  }, []);

  const checkOfflineEarnings = (parsed) => {
    const lastSave = parsed.user.lastSaveTime || Date.now();
    const diffHours = (Date.now() - lastSave) / MS_IN_HOUR;
    
    // Simula ganhos offline apenas se passou tempo suficiente (6 min)
    if (diffHours > 0.1) { 
      let totalOffline = 0;
      parsed.mines.forEach(mine => {
        if (mine.automation?.active && new Date(mine.automation.expiresAt) > new Date()) {
           let prod = mine.baseProduction * (mine.gnomes || 0);
           // Simulação simplificada de produção offline
           if (mine.durability > 0 && prod > 0) totalOffline += prod * diffHours;
        }
      });
      
      if (totalOffline > 0) {
        setOfflineEarnings(totalOffline.toFixed(2));
        setShowOfflineModal(true);
        setUser(prev => ({ 
          ...prev, 
          gnocripto: prev.gnocripto + totalOffline, 
          lifetimeEarnings: prev.lifetimeEarnings + totalOffline 
        }));
      }
    }
  };

  // --- CICLO DE VIDA: SALVAMENTO AUTOMÁTICO ---
  useEffect(() => {
    if (!isLoaded || !isAuthenticated) return; 
    
    const saveGame = () => {
      setIsSaving(true);
      const dataToSave = { user: { ...user, lastSaveTime: Date.now() }, mines, missions };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      setTimeout(() => setIsSaving(false), 800);
    };
    
    const saveInterval = setInterval(saveGame, 5000); 
    return () => clearInterval(saveInterval);
  }, [user, mines, missions, isLoaded, isAuthenticated]);

  // --- RELÓGIO GLOBAL ---
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LIMPEZA DE NOTIFICAÇÕES ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (floatingTexts.length > 0) {
      const timer = setTimeout(() => {
        setFloatingTexts(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [floatingTexts]);

  // --- SIMULAÇÃO DE MERCADO (ORACLE) ---
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
      
      // Reseta outros para 1.0 para focar na notícia atual (Simulação MVP)
      const baseTrends = { GOLD: 1.0, SILVER: 1.0, COPPER: 1.0, IRON: 1.0, COAL: 1.0 };
      setMarketTrends({ ...baseTrends, [randomType]: newMultiplier });
      setMarketNews(newsText);
      
      if(isAuthenticated) showNotify('info', 'Mercado Atualizado!');
    }, 30000); // 30 segundos
    return () => clearInterval(marketInterval);
  }, [isAuthenticated]);

  const showNotify = (type, msg) => setNotification({ type, message: msg });

  // --- LÓGICA DE NEGÓCIO ---

  const handleLogin = () => {
    setIsConnecting(true);
    setTimeout(() => {
      // Simula conexão com carteira Polygon
      const mockAddress = "0x71C9...9A21"; 
      setUser(prev => ({ 
        ...prev, 
        walletAddress: mockAddress, 
        username: `Miner_${mockAddress.substring(0,6)}` 
      }));
      setIsAuthenticated(true);
      setIsConnecting(false);
      
      if (!user.hasSeenTutorial) {
        setTimeout(() => { setShowTutorial(true); setTutorialStep(1); }, 500);
      }
    }, 2000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(prev => ({...prev, walletAddress: null}));
    // Não limpamos o Save Key aqui para permitir "reconectar", 
    // mas em um app real limparíamos tokens de sessão.
    setShowSettingsModal(false);
  };

  const calculateProduction = (mine) => {
    let prod = mine.baseProduction * (mine.gnomes > 0 ? mine.gnomes : 0);
    if (mine.gnomes === 0 || mine.durability <= 0) return 0;
    
    // Equipamentos (Flat e Multiplier)
    const flatBonus = mine.equipments.filter(e => e.bonusType === 'flat').reduce((acc, e) => acc + e.bonusValue, 0);
    prod += flatBonus;
    
    const multiplierBonus = mine.equipments.filter(e => e.bonusType === 'multiplier').reduce((acc, e) => acc + e.bonusValue, 0);
    prod = prod * (1 + multiplierBonus);

    // Bônus de Guilda
    if (user.guild) prod = prod * 1.05; 
    
    // Tendência de Mercado
    const trend = marketTrends[mine.type] || 1.0;
    prod = prod * trend;

    return parseFloat(prod.toFixed(2));
  };

  const handleHarvest = (mineId, event) => {
    const mineIndex = mines.findIndex(m => m.id === mineId);
    const mine = mines[mineIndex];
    
    if (mine.durability <= 0) { showNotify('error', 'Mina quebrada! Repare primeiro.'); return; }

    const diffHours = (now - new Date(mine.lastCollected).getTime()) / MS_IN_HOUR;
    const isReady = diffHours >= CYCLE_HOURS;
    const isAuto = mine.automation.active;

    if (!isReady && !isAuto) return;
    if (user.energy < 2) { showNotify('error', 'Sem energia!'); return; }

    const hoursToPay = isAuto ? diffHours : CYCLE_HOURS;
    const productionRate = calculateProduction(mine);
    const reward = parseFloat((productionRate * hoursToPay).toFixed(2));
    const xpGained = Math.floor(reward * XP_PER_GNOCRIPTO);
    
    // Efeito Visual (Juice)
    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;
    setFloatingTexts(prev => [...prev, { id: Date.now(), x, y, text: `+${reward} ₲` }]);

    const updatedMines = [...mines];
    updatedMines[mineIndex].lastCollected = new Date().toISOString();
    
    // Desgaste da Mina
    const newDurability = Math.max(0, mine.durability - DURABILITY_LOSS_PER_HARVEST);
    updatedMines[mineIndex].durability = newDurability;
    setMines(updatedMines);

    if (newDurability === 0) setEventModal({ type: 'bad', title: 'Colapso!', desc: `A estrutura da ${mine.name} cedeu.` });

    // Level Up Logic
    let newXp = user.xp + xpGained;
    let newLevel = user.level;
    let newNextLevelXp = user.nextLevelXp;
    if (newXp >= user.nextLevelXp) {
      newLevel++;
      newXp -= user.nextLevelXp;
      newNextLevelXp = Math.floor(newNextLevelXp * 1.5);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000);
    }

    setUser(prev => ({
      ...prev,
      gnocripto: prev.gnocripto + reward,
      energy: prev.energy - 2,
      xp: newXp,
      level: newLevel,
      nextLevelXp: newNextLevelXp,
      lifetimeEarnings: prev.lifetimeEarnings + reward
    }));
    
    updateMissionProgress('harvest');
    triggerRandomEvent(mine.name);
  };

  const handleRepair = (mineId) => {
    const mineIndex = mines.findIndex(m => m.id === mineId);
    if (user.gnocripto < REPAIR_COST_BASE) { showNotify('error', 'Saldo insuficiente!'); return; }
    
    const updatedMines = [...mines];
    updatedMines[mineIndex].durability = 100;
    setMines(updatedMines);
    
    setUser(prev => ({ 
      ...prev, 
      gnocripto: prev.gnocripto - REPAIR_COST_BASE, 
      totalSpent: prev.totalSpent + REPAIR_COST_BASE 
    }));
    showNotify('success', 'Mina reparada!');
    updateMissionProgress('spend', REPAIR_COST_BASE);
  };

  const handleWalletTransaction = (type, amount, currency) => {
    if (type === 'deposit') {
      setUser(prev => ({
        ...prev, 
        [currency]: prev[currency] + amount,
        transactions: [{ type: 'DEPOSIT', amount, currency, date: new Date().toLocaleTimeString() }, ...(prev.transactions || [])]
      }));
      showNotify('success', `Depósito de ${amount} ${currency.toUpperCase()} confirmado!`);
    } else {
      if (user[currency] < amount) return showNotify('error', 'Saldo insuficiente');
      setUser(prev => ({
        ...prev, 
        [currency]: prev[currency] - amount,
        transactions: [{ type: 'WITHDRAW', amount, currency, date: new Date().toLocaleTimeString() }, ...(prev.transactions || [])]
      }));
      showNotify('success', `Saque de ${amount} ${currency.toUpperCase()} realizado!`);
    }
  };

  // Funções Auxiliares
  const joinGuild = (guild) => { setUser(prev => ({ ...prev, guild: guild })); setShowGuildModal(false); showNotify('success', `Bem-vindo à ${guild.name}!`); };
  
  const resetGame = () => { 
    localStorage.removeItem(SAVE_KEY); 
    setMines(INITIAL_MINES); 
    setUser({...INITIAL_USER, hasSeenTutorial: false}); 
    setMissions(DAILY_MISSIONS); 
    setShowSettingsModal(false); 
    setIsAuthenticated(false); 
    showNotify('success', 'Resetado!'); 
  };
  
  const triggerRandomEvent = (mineName) => {
    const chance = Math.random();
    if (chance > 0.85) { // 15% Chance
      const isGood = Math.random() > 0.4;
      if (isGood) {
        const bonus = 50; setUser(prev => ({ ...prev, gnocripto: prev.gnocripto + bonus })); 
        setEventModal({ type: 'good', title: 'Veio de Ouro!', desc: `Gnomes da ${mineName} acharam +${bonus} GnoCripto!` });
      } else {
        const energyLost = 10; setUser(prev => ({ ...prev, energy: Math.max(0, prev.energy - energyLost) })); 
        setEventModal({ type: 'bad', title: 'Acidente!', desc: `Desmoronamento na ${mineName}. -${energyLost} Energia.` });
      }
    }
  };
  
  const updateMissionProgress = (type, amount = 1) => { 
    setMissions(prev => prev.map(m => { 
      if (m.claimed) return m; 
      let newProgress = m.progress; 
      if (m.id === 1 && type === 'harvest') newProgress += amount; 
      if (m.id === 2 && type === 'spend') newProgress += amount; 
      return { ...m, progress: Math.min(newProgress, m.target) }; 
    })); 
  };
  
  const claimMission = (id) => { 
    const mission = missions.find(m => m.id === id); 
    if (!mission || mission.progress < mission.target || mission.claimed) return; 
    if (mission.reward.type === 'energy') setUser(prev => ({ ...prev, energy: Math.min(prev.energy + mission.reward.amount, prev.maxEnergy) })); 
    else if (mission.reward.type === 'xp') setUser(prev => ({ ...prev, xp: prev.xp + mission.reward.amount })); 
    setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m)); 
    showNotify('success', 'Recompensa resgatada!'); 
  };
  
  const handleSpinWheel = () => { 
    if (isSpinning) return; 
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

  // --- RENDER FUNCTIONS (Definidas no escopo do componente para acesso ao state) ---

  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="z-10 text-center w-full max-w-sm">
        <div className="w-24 h-24 bg-yellow-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-yellow-500/30 rotate-12">
          <Pickaxe size={48} className="text-gray-900" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">GnoMines</h1>
        <p className="text-gray-400 mb-10 text-sm">Gerencie minas, contrate gnomes e lucre crypto.</p>
        
        <button 
          onClick={handleLogin}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-gray-900 font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="animate-spin" /> Conectando Carteira...
            </>
          ) : (
            <>
              <Wallet /> Conectar Web3 Wallet
            </>
          )}
        </button>
        <p className="text-xs text-gray-600 mt-6 font-mono">Polygon Network (Simulado)</p>
      </div>
    </div>
  );

  const renderWalletModal = () => {
    if (!showWalletModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex gap-2"><Wallet size={18}/> Minha Carteira</h3>
            <button onClick={()=>setShowWalletModal(false)}><X className="text-gray-400" /></button>
          </div>
          
          <div className="p-4 bg-gray-900 m-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500 mb-1">Endereço Conectado (Polygon)</p>
            <p className="text-sm font-mono text-green-400 truncate">{user.walletAddress || "0x..."}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><History size={12}/> Histórico de Transações</h4>
            {(!user.transactions || user.transactions.length === 0) ? (
              <p className="text-gray-600 text-center text-xs py-4">Nenhuma transação recente.</p>
            ) : (
              <div className="space-y-2">
                {user.transactions.map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-700/30 p-2 rounded border border-gray-700/50">
                    <div>
                      <p className={`text-xs font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'DEPOSIT' ? 'Entrada' : 'Saída'}</p>
                      <p className="text-[10px] text-gray-500">{tx.date}</p>
                    </div>
                    <p className="text-sm font-mono font-bold text-white">{tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount} {tx.currency}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl space-y-2">
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => handleWalletTransaction('deposit', 10, 'usdt')} className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><ArrowDownRight size={14}/> Depositar USDT</button>
               <button onClick={() => handleWalletTransaction('withdraw', 10, 'usdt')} className="bg-red-600/20 text-red-400 border border-red-500 hover:bg-red-900/40 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><ArrowUpRight size={14}/> Sacar USDT</button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNetworkModal = () => {
    if (!showNetworkModal) return null;
    const referralLink = `gnomines.game/ref/${user.walletAddress || '...'}`;
    
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex gap-2"><Network className="text-purple-400"/> Rede de Afiliados</h3>
            <button onClick={() => setShowNetworkModal(false)}><X className="text-gray-400" /></button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 mb-6">
              <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Seu Link de Indicação (Web3)</p>
              <div className="flex gap-2">
                <div className="bg-gray-900 flex-1 p-3 rounded border border-gray-700 text-xs font-mono text-center select-all text-purple-200 truncate">
                  {referralLink}
                </div>
                <button onClick={() => showNotify('success', 'Link copiado!')} className="bg-purple-600 hover:bg-purple-500 p-2 rounded text-white"><Copy size={16}/></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold">Total Ganho</p><p className="text-xl font-bold text-green-400">0.00 GNO</p></div>
              <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-700"><p className="text-[10px] text-gray-400 uppercase font-bold">Rede Ativa</p><p className="text-xl font-bold text-blue-400">0 Pessoas</p></div>
            </div>

            <h4 className="text-xs font-bold text-gray-300 uppercase mb-3 flex items-center gap-2"><Award size={14}/> Estrutura de Ganhos (20%)</h4>
            <div className="space-y-2">
              {[
                { lvl: 1, pct: 10, color: "text-green-400", label: "Indicação Direta" },
                { lvl: 2, pct: 4, color: "text-blue-400", label: "Nível 2" },
                { lvl: 3, pct: 3, color: "text-yellow-400", label: "Nível 3" },
                { lvl: 4, pct: 2, color: "text-orange-400", label: "Nível 4" },
                { lvl: 5, pct: 1, color: "text-red-400", label: "Nível 5" },
              ].map((tier) => (
                <div key={tier.lvl} className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800">
                  <span className="text-xs text-gray-400 font-bold">Nível {tier.lvl}</span>
                  <span className="text-xs text-gray-500">{tier.label}</span>
                  <span className={`text-sm font-bold ${tier.color}`}>{tier.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRankingModal = () => {
    if (!showRankingModal) return null;
    const sortedLeaderboard = [...LEADERBOARD_DATA, { id: 99, name: user.username, level: user.level, xp: user.xp, avatar: "bg-gray-700", isUser: true }].sort((a, b) => b.xp - a.xp);
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 flex flex-col max-h-[70vh]">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Trophy className="text-yellow-400"/> Ranking Global</h3><button onClick={() => setShowRankingModal(false)}><X className="text-gray-400" /></button></div>
          <div className="p-4 overflow-y-auto">{sortedLeaderboard.map((player, index) => (<div key={player.id} className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${player.isUser ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-700/50 border-gray-700'}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 flex items-center justify-center font-bold rounded ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{index + 1}</div><div><p className={`font-bold text-sm ${player.isUser ? 'text-purple-300' : 'text-gray-200'}`}>{player.name}</p><p className="text-xs text-gray-400">Lvl {player.level}</p></div></div><div className="text-right"><p className="text-sm font-mono font-bold text-yellow-500">{player.xp.toLocaleString()} XP</p></div></div>))}</div>
        </div>
      </div>
    );
  };

  const renderGuildModal = () => {
    if (!showGuildModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Users className="text-blue-400"/> Guildas Abertas</h3><button onClick={() => setShowGuildModal(false)}><X className="text-gray-400" /></button></div>
          <div className="p-4 space-y-3">
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 mb-4 text-xs text-blue-200 text-center">Entre em uma guilda e ganhe <strong>+5% de Produção</strong> em todas as minas!</div>
            {GUILDS_DATA.map(guild => (
              <div key={guild.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-200">{guild.name}</p>
                  <p className="text-xs text-gray-500">{guild.members} Membros • {guild.desc}</p>
                </div>
                <button onClick={() => joinGuild(guild)} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold">Entrar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><Settings className="text-gray-300"/> Configurações</h3><button onClick={() => setShowSettingsModal(false)}><X className="text-gray-400" /></button></div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
              <span className="text-gray-300 flex items-center gap-2">{user.settings.sound ? <Volume2 size={16}/> : <VolumeX size={16}/>} Efeitos Sonoros</span>
              <button onClick={() => setUser(p => ({...p, settings: {...p.settings, sound: !p.settings.sound}}))} className={`w-10 h-6 rounded-full p-1 transition-colors ${user.settings.sound ? 'bg-green-500' : 'bg-gray-600'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${user.settings.sound ? 'translate-x-4' : 'translate-x-0'}`}></div></button>
            </div>
            <button onClick={() => { setShowSettingsModal(false); setShowTutorial(true); setTutorialStep(1); }} className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"><HelpCircle size={16}/> Ver Tutorial Novamente</button>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-1"><ShieldAlert size={12}/> Zona de Perigo</h4>
              <button onClick={resetGame} className="w-full bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 text-red-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><RefreshCw size={16}/> RESETAR TODO PROGRESSO</button>
              <p className="text-[10px] text-gray-500 mt-2 text-center">Isso apagará suas minas, gnomes e saldo. Usado para testes.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWheelModal = () => {
    if (!showWheelModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700 p-6 flex flex-col items-center">
          <div className="flex justify-between w-full mb-6"><h3 className="font-bold text-white flex gap-2"><Sparkles className="text-yellow-400"/> Roleta da Fortuna</h3><button onClick={() => !isSpinning && setShowWheelModal(false)}><X className="text-gray-400" /></button></div>
          <div className={`relative w-48 h-48 rounded-full border-4 border-yellow-600 bg-gray-900 flex items-center justify-center mb-8 shadow-2xl ${isSpinning ? 'animate-spin' : ''}`}><Dices size={48} className="text-gray-600" /><div className="absolute top-0 w-2 h-4 bg-red-500 -mt-2"></div></div>
          <button onClick={handleSpinWheel} disabled={isSpinning} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all ${isSpinning ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:scale-105 active:scale-95'}`}>{isSpinning ? 'GIRANDO...' : 'GIRAR AGORA!'}</button>
        </div>
      </div>
    );
  };

  const renderEventModal = () => {
    if (!eventModal) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className={`w-full max-w-xs p-6 rounded-2xl shadow-2xl border-2 text-center transform scale-100 animate-bounce ${eventModal.type === 'good' ? 'bg-gray-800 border-yellow-500' : 'bg-gray-800 border-red-500'}`}>
          <div className="flex justify-center mb-4">{eventModal.type === 'good' ? <Gift size={48} className="text-yellow-400" /> : <ShieldAlert size={48} className="text-red-400" />}</div>
          <h2 className={`text-xl font-bold mb-2 ${eventModal.type === 'good' ? 'text-yellow-400' : 'text-red-400'}`}>{eventModal.title}</h2>
          <p className="text-gray-300 text-sm mb-6">{eventModal.desc}</p>
          <button onClick={() => setEventModal(null)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-bold">OK</button>
        </div>
      </div>
    );
  };

  const renderMissionsModal = () => {
    if (!showMissionsModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 w-full max-w-sm rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center"><h3 className="font-bold text-white flex gap-2"><CheckSquare/> Missões Diárias</h3><button onClick={() => setShowMissionsModal(false)}><X className="text-gray-400" /></button></div>
          <div className="p-4 space-y-3">
            {missions.map(m => {
              const isComplete = m.progress >= m.target;
              return (
                <div key={m.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <div className="flex justify-between mb-2"><span className="text-sm text-gray-200 font-bold">{m.text}</span><span className="text-xs text-blue-400 flex items-center gap-1"><Gift size={12}/> {m.reward.amount} {m.reward.type}</span></div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3"><div className="h-full bg-blue-500" style={{ width: `${(m.progress/m.target)*100}%` }}></div></div>
                  <button onClick={() => claimMission(m.id)} disabled={!isComplete || m.claimed} className={`w-full py-2 rounded text-xs font-bold uppercase ${m.claimed ? 'bg-gray-700 text-gray-500' : isComplete ? 'bg-green-600 text-white animate-pulse' : 'bg-gray-700 text-gray-400'}`}>{m.claimed ? 'Resgatado' : isComplete ? 'Resgatar Prêmio' : `${m.progress}/${m.target}`}</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTutorial = () => {
    if (!showTutorial) return null;
    const steps = [
      { title: "Bem-vindo, CEO!", desc: "Seu objetivo é gerenciar minas, contratar gnomes e acumular GnoCripto.", target: "center" },
      { title: "Minas e Energia", desc: "Clique em 'COLHER' para ganhar recursos. Cuidado com a Energia e Durabilidade!", target: "center" },
      { title: "Mercado Vivo", desc: "Fique de olho nas Notícias no topo. Preços de Ouro, Prata e outros flutuam a cada 30 segundos!", target: "center" },
      { title: "Evolua e Conquiste", desc: "Use a Loja para comprar equipamentos e automação. Suba no Ranking Global!", target: "center" },
    ];
    const current = steps[tutorialStep - 1];

    return (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="bg-gray-800 border-2 border-yellow-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full border-4 border-gray-900">
            GUIA DO MINERADOR {tutorialStep}/{steps.length}
          </div>
          <h3 className="text-xl font-bold text-white mt-4 mb-2 text-center">{current.title}</h3>
          <p className="text-gray-300 text-center mb-6 text-sm leading-relaxed">{current.desc}</p>
          <div className="flex gap-2">
            <button onClick={() => { setShowTutorial(false); setUser(prev => ({ ...prev, hasSeenTutorial: true })); }} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-700 text-sm">Pular</button>
            <button onClick={() => tutorialStep < steps.length ? setTutorialStep(s => s + 1) : (() => { setShowTutorial(false); setUser(prev => ({ ...prev, hasSeenTutorial: true })); })()} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-sm shadow-lg shadow-yellow-900/20">{tutorialStep < steps.length ? "Próximo >" : "Começar!"}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderOfflineModal = () => {
    if (!showOfflineModal) return null;
    return (
      <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
        <div className="bg-gray-800 w-full max-w-sm rounded-2xl border-2 border-green-500 p-6 shadow-2xl relative animate-bounce">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 p-4 rounded-full border-4 border-gray-900">
            <Moon size={32} className="text-white fill-current" />
          </div>
          <h2 className="text-2xl font-black text-white mt-6 text-center">BEM-VINDO DE VOLTA!</h2>
          <p className="text-gray-300 text-center text-sm mt-2 mb-6">Seus Gnomes Coletores trabalharam duro enquanto você dormia.</p>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center gap-2 mb-6">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Lucro Offline</span>
            <div className="text-3xl font-black text-green-400 flex items-center gap-2">
              <Coins size={28}/> +{offlineEarnings}
            </div>
          </div>
          <button onClick={() => setShowOfflineModal(false)} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/50 uppercase tracking-wide">Coletar Lucros</button>
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

  const renderMines = () => (
    <div className="space-y-4 pb-24 px-4 pt-4">
      {renderAdvice()}
      <h1 className="text-xl font-bold text-gray-100 mt-4">Minas Ativas</h1>
      {mines.map(mine => {
        const diffMs = now - new Date(mine.lastCollected).getTime();
        const cycleMs = CYCLE_HOURS * MS_IN_HOUR;
        const isReady = diffMs >= cycleMs;
        const isAuto = mine.automation.active;
        const isStopped = mine.gnomes === 0;
        const isBroken = mine.durability <= 0;
        
        let progress = Math.min((diffMs / cycleMs) * 100, 100);
        if (isAuto && isReady) progress = 100;
        const currentProduction = calculateProduction(mine);
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
                <div><h3 className="font-bold text-gray-100">{mine.name}</h3><div className="text-xs text-gray-400 flex items-center gap-1"><User size={10} /> {mine.gnomes} • <span className={`${isBooming ? 'text-green-400' : isCrashing ? 'text-red-400' : 'text-yellow-400'} font-bold ml-1 flex items-center gap-0.5`}>{currentProduction}/h {isBooming && <ArrowUpRight size={10}/>}{isCrashing && <ArrowDownRight size={10}/>}</span></div></div>
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
      <h1 className="text-xl font-bold text-gray-100 mb-4">Loja de Itens</h1>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-blue-900/50 flex items-center justify-center text-blue-400"><Zap size={24} /></div><div><h3 className="font-bold text-gray-100">Pack de Energia</h3><p className="text-xs text-gray-400">+20 Pontos de Energia</p></div></div>
          <button onClick={buyEnergy} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 active:scale-95 transition-transform"><Coins size={14} className="text-yellow-400" /> {PRICES.ENERGY_PACK_SMALL.cost}</button>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Contratação</h3>
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-yellow-900/30 flex items-center justify-center text-yellow-500"><User size={24} /></div><div><h3 className="font-bold text-gray-100">Gnomo Trabalhador</h3><p className="text-xs text-gray-400">Multiplica a produção.</p></div></div>
          <button onClick={() => setTargetMineSelection(PRICES.WORKER_GNOME)} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1"><Coins size={14} className="text-yellow-200" /> {PRICES.WORKER_GNOME.cost}</button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-purple-900/30 flex items-center justify-center text-purple-400"><Bot size={24} /></div><div><h3 className="font-bold text-gray-100">Gnomo Coletor (7 Dias)</h3><p className="text-xs text-gray-400">Coleta automática 24h.</p></div></div>
          <button onClick={() => setTargetMineSelection(PRICES.COLLECTOR_GNOME)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1"><DollarSign size={14} className="text-green-200" /> {PRICES.COLLECTOR_GNOME.cost}</button>
        </div>
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
    const totalGnomes = mines.reduce((acc, m) => acc + m.gnomes, 0);
    const totalEquipments = mines.reduce((acc, m) => acc + m.equipments.length, 0);
    const bestMine = [...mines].sort((a,b) => calculateProduction(b) - calculateProduction(a))[0];
    return (
      <div className="pb-24 px-4 pt-4 space-y-6">
        <h1 className="text-xl font-bold text-gray-100 mb-4">Perfil do Investidor</h1>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-yellow-500 flex items-center justify-center mb-4"><User size={48} className="text-gray-300" /></div>
          <h2 className="text-2xl font-bold text-white">{user.username}</h2>
          <p className="text-purple-400 font-bold mb-1">Nível {user.level} (CEO)</p>
          {user.guild && <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-2 flex items-center gap-1"><Users size={12}/> {user.guild.name}</span>}
          <p className="text-gray-500 text-xs">Membro desde {user.joinDate}</p>
          
          <div className="flex gap-2 w-full mt-4">
             {!user.guild && <button onClick={() => setShowGuildModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-sm font-bold flex items-center justify-center gap-2"><Users size={16}/> Guilda</button>}
             <button onClick={() => setShowNetworkModal(true)} className="flex-1 bg-purple-600 hover:bg-purple-500 py-2 rounded text-sm font-bold flex items-center justify-center gap-2"><Network size={16}/> Minha Rede</button>
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
             <div className="bg-gray-900 flex-1 p-2 rounded border border-gray-700 text-xs font-mono text-center select-all text-gray-300">
               {`gnomines.game/ref/${user.walletAddress}`}
             </div>
             <button onClick={() => showNotify('success', 'Link copiado para área de transferência!')} className="bg-purple-600 hover:bg-purple-500 px-4 rounded text-xs font-bold text-white">Copiar</button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><PieChart size={16}/> <span className="text-xs font-bold uppercase">Total Minerado</span></div><p className="text-xl font-bold text-yellow-400">{user.lifetimeEarnings.toLocaleString()} Gno</p></div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><TrendingUp size={16}/> <span className="text-xs font-bold uppercase">Investimento</span></div><p className="text-xl font-bold text-red-400">-{user.totalSpent.toLocaleString()} Gno</p></div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><Briefcase size={16}/> <span className="text-xs font-bold uppercase">Força de Trabalho</span></div><p className="text-xl font-bold text-blue-400">{totalGnomes} Gnomes</p></div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700"><div className="flex items-center gap-2 mb-2 text-gray-400"><Award size={16}/> <span className="text-xs font-bold uppercase">Melhor Mina</span></div><p className="text-sm font-bold text-green-400">{bestMine.name}</p><p className="text-xs text-gray-500">{calculateProduction(bestMine)}/h</p></div>
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
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col overflow-hidden relative">
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
      <div className="sticky top-0 z-20 bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-md mx-auto px-3 py-2">
          {/* Linha 1: Info Usuário e Saldo */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-700 border border-yellow-500 flex items-center justify-center">
                  <User size={20} className="text-gray-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-gray-800">
                  {user.level}
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xs font-bold text-gray-100 flex items-center gap-1 max-w-[100px] truncate">
                  {user.username}
                  {isSaving && <Activity size={10} className="text-green-400 animate-pulse" />}
                </h2>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}/>
                </div>
              </div>
            </div>
            
            <button onClick={() => setShowWalletModal(true)} className="bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-700 hover:bg-gray-700 flex flex-col items-end min-w-[100px]">
               <div className="flex items-center gap-1 text-yellow-400 font-black text-lg leading-none mb-0.5"><Coins size={14} /><span>{user.gnocripto.toFixed(0)}</span></div>
               <div className="flex items-center gap-1 text-green-400 text-[10px] font-mono leading-none"><DollarSign size={10} /><span>{user.usdt.toFixed(2)}</span></div>
            </button>
          </div>

          {/* Linha 2: Ações e Energia */}
          <div className="flex items-center gap-2 justify-between">
             <div className="flex gap-1.5">
               <button onClick={() => setShowSettingsModal(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-300"><Settings size={16} /></button>
               <button onClick={() => setShowRankingModal(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-yellow-400"><Trophy size={16} /></button>
               <button onClick={() => setShowWheelModal(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-purple-400"><Dices size={16} /></button>
               <button onClick={() => setShowMissionsModal(true)} className="relative p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-blue-400">
                 <CheckSquare size={16} />
                 {missions.some(m => m.progress >= m.target && !m.claimed) && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-gray-800"></span>}
               </button>
             </div>
             
             <div className="flex-1 bg-gray-900 rounded-lg p-1.5 flex items-center gap-2 border border-gray-700 ml-1">
                <Zap size={12} className="text-blue-400 shrink-0" />
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(user.energy / user.maxEnergy) * 100}%` }}></div></div>
                <span className="text-[10px] font-mono text-blue-300 w-8 text-right">{user.energy}</span>
             </div>
          </div>

          {/* Linha 3: Notícias (Mais discreto) */}
          <div className="mt-2 flex items-center gap-2 overflow-hidden bg-black/20 rounded px-2 py-1">
             <Newspaper size={10} className="text-gray-500 flex-shrink-0" />
             <span className="text-[10px] text-gray-400 whitespace-nowrap truncate">{marketNews}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full relative">
        {currentTab === 'mines' ? renderMines() : currentTab === 'store' ? renderStore() : renderProfile()}
      </div>
      
      {/* Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 py-2 pb-6 z-40">
        <div className="max-w-md mx-auto flex justify-around">
          <button onClick={() => setCurrentTab('mines')} className={`${currentTab === 'mines' ? 'text-yellow-500' : 'text-gray-500'} flex flex-col items-center`}><LayoutDashboard size={24} /><span className="text-xs">Minas</span></button>
          <button onClick={() => setCurrentTab('store')} className={`${currentTab === 'store' ? 'text-yellow-500' : 'text-gray-500'} flex flex-col items-center`}><ShoppingBag size={24} /><span className="text-xs">Loja</span></button>
          <button onClick={() => setCurrentTab('profile')} className={`${currentTab === 'profile' ? 'text-yellow-500' : 'text-gray-500'} flex flex-col items-center`}><User size={24} /><span className="text-xs">Perfil</span></button>
        </div>
      </div>

      {notification && <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl font-bold text-sm z-50 flex gap-2 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.message}</div>}
      
      {targetMineSelection && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-sm rounded p-4 border border-gray-700">
            <h3 className="font-bold mb-4">Aplicar {targetMineSelection.name} em:</h3>
            {mines.map(m => (
              <button key={m.id} onClick={() => confirmPurchaseForMine(m.id)} className="w-full p-3 mb-2 bg-gray-700 rounded text-left flex justify-between hover:bg-gray-600 border border-gray-700">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${m.color}`}></div>
                  <span>{m.name}</span>
                </div>
                {targetMineSelection.type === 'automation' && m.automation.active ? (
                  <span className="text-red-400 text-xs">Já possui</span>
                ) : (
                  <ArrowUpCircle size={16} className="text-green-400"/>
                )}
              </button>
            ))}
            <button onClick={()=>setTargetMineSelection(null)} className="w-full mt-2 text-gray-500">Cancelar</button>
          </div>
        </div>
      )}

      {renderWalletModal()}
      {renderMissionsModal()}
      {renderEventModal()}
      {renderWheelModal()}
      {renderRankingModal()}
      {renderSettingsModal()}
      {renderGuildModal()}
      {renderNetworkModal()} 
      {renderTutorial()}
      {renderOfflineModal()}
      {showLevelUp && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 pointer-events-none"><div className="bg-purple-600 px-8 py-6 rounded-xl animate-bounce text-center border-4 border-yellow-400"><h2 className="text-3xl font-black">LEVEL UP!</h2></div></div>}
      
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