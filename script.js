import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1';
import React, { useState, useEffect, useRef, useMemo } from 'https://esm.sh/react@18.3.1';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  Trophy,
  Target,
  Users,
  Edit3,
  Eye,
  Plus,
  Trash2,
  Star,
  Award,
  Calendar,
  CheckCircle2,
  Flame,
  ThumbsUp,
  Sparkles,
  X,
  ChevronRight,
  Flag,
  TrendingUp,
  Shield,
  Compass,
  Move,
  ArrowRight,
  CornerUpRight,
  Undo2,
  Check,
  Clock,
  Home,
  ArrowLeft,
  ListChecks,
  Cloud,
  Share,
  Smartphone
} from 'https://esm.sh/lucide-react@0.383.0?deps=react@18.3.1';
// ==========================================
// 初期サンプルデータ (オクトパス：低学年・高学年)
// ==========================================
const INITIAL_GOALS = {
  junior: {
    categorySubtitle: '元気にチャレンジ！基礎と楽しさ',
    slogan: 'オクトパス魂！たのしく げんきに ぜんりょくプレー！',
    longTerm: 'ボールとなかよくなって、みんなで 10てん とろう！',
    seasons: [
      {
        id: 'js-1',
        title: 'あきの チャレンジきかん',
        period: '2026年10月〜11月（2ヶ月間）',
        goal: '3ぽ ステップで ジャンプシュートに ちょうせんしよう！',
        isActive: true
      },
      {
        id: 'js-2',
        title: 'ふゆの たいかい まえしあげ',
        period: '2026年12月（1ヶ月強化月間）',
        goal: 'パスを落とさずに 5かい つないで シュートまで いこう！',
        isActive: false
      },
      {
        id: 'js-3',
        title: 'しんねん スタートダッシュ',
        period: '2027年1月〜3月（3ヶ月間）',
        goal: 'しあいで 1てん とって みんなで よろこぼう！',
        isActive: false
      }
    ]
  },
  senior: {
    categorySubtitle: '堅守速攻・戦術理解・チームワーク',
    slogan: 'OCTOPUS PRIDE！鉄壁の守備から電光石火の速攻へ',
    longTerm: '県大会ベスト4進出 ＆ チーム平均失点12点以下',
    seasons: [
      {
        id: 'ss-1',
        title: '秋季公式戦 実践フェーズ',
        period: '2026年10月〜11月（2ヶ月間）',
        goal: 'セットオフェンスの連携強化（クロス・ポストプレーの精度UP）と速攻の意識徹底',
        isActive: true
      },
      {
        id: 'ss-2',
        title: '冬季基礎・フィジカル強化月間',
        period: '2026年12月（1ヶ月集中期間）',
        goal: '1対1のディフェンスフットワーク強化と体幹トレーニングの徹底',
        isActive: false
      },
      {
        id: 'ss-3',
        title: '県大会ファイナル準備期',
        period: '2027年1月〜3月（3ヶ月間）',
        goal: 'シュート決定率65%達成・劣勢時でも崩れないメンタルと戦術遂行力',
        isActive: false
      }
    ]
  }
};

const INITIAL_PLAYERS = [
  {
    id: 'p-j1',
    category: 'junior',
    number: 3,
    name: 'はやと',
    position: 'フローター',
    goal: '3ぽ ステップで 力づよく シュートを うつ！',
    progress: 4,
    metric: 'シュート 5ほん せいこう',
    stampType: 'hanamaru',
    coachNote: 'ステップの リズムが すごく よくなったよ！'
  },
  {
    id: 'p-j2',
    category: 'junior',
    number: 7,
    name: 'さくら',
    position: 'サイド',
    goal: 'りょうてで しっかり キャッチする！',
    progress: 5,
    metric: 'パスキャッチ 10かい れんぞく',
    stampType: 'hanamaru',
    coachNote: 'こえを だして パスを もらう すがたが ばっちり！'
  },
  {
    id: 'p-j3',
    category: 'junior',
    number: 1,
    name: 'りく',
    position: 'キーパー',
    goal: 'ボールから めを はなさずに まえに でる！',
    progress: 3,
    metric: 'ナイスセーブ 3かい',
    stampType: 'fight',
    coachNote: 'こわがらずに まえへ でる ゆうきが 出てきたね！'
  },
  {
    id: 'p-s1',
    category: 'senior',
    number: 4,
    name: '蓮（れん）',
    position: 'センター (CB)',
    goal: 'フェイントからの1対1突破と、ポストへの的確なアシスト',
    progress: 4,
    metric: '1試合アシスト3本以上 / ターンオーバー2回以内',
    stampType: 'hanamaru',
    coachNote: 'ゲームメイクの視野が格段に広がっている。'
  },
  {
    id: 'p-s2',
    category: 'senior',
    number: 9,
    name: '陽菜（ひな）',
    position: 'レフトバック (LB)',
    goal: 'ディフェンスの頭上を越えるロングシュートの決定率向上',
    progress: 4,
    metric: '9mライン外からのシュート決定率 60%',
    stampType: 'fight',
    coachNote: 'ジャンプの最高点でリリースすることを意識しよう。'
  },
  {
    id: 'p-s3',
    category: 'senior',
    number: 12,
    name: '颯太（そうた）',
    position: 'ゴールキーパー (GK)',
    goal: 'ディフェンスとの連携確認と、速攻への正確なロングパス',
    progress: 5,
    metric: '阻止率 45%以上 / 速攻アシスト1試合2本',
    stampType: 'hanamaru',
    coachNote: '守護神としてチームを救うビッグセーブが光る！'
  }
];

const DEFAULT_PIECES_OFFENSE = [
  { id: 'o1', type: 'offense', label: 'LW', x: 38, y: 45 },
  { id: 'o2', type: 'offense', label: 'LB', x: 95, y: 195 },
  { id: 'o3', type: 'offense', label: 'CB', x: 200, y: 215 },
  { id: 'o4', type: 'offense', label: 'RB', x: 305, y: 195 },
  { id: 'o5', type: 'offense', label: 'RW', x: 362, y: 45 },
  { id: 'o6', type: 'offense', label: 'PV', x: 225, y: 132 },
  { id: 'd1', type: 'defense', label: 'D1', x: 65, y: 65 },
  { id: 'd2', type: 'defense', label: 'D2', x: 120, y: 112 },
  { id: 'd3', type: 'defense', label: 'D3', x: 180, y: 132 },
  { id: 'd4', type: 'defense', label: 'D4', x: 230, y: 132 },
  { id: 'd5', type: 'defense', label: 'D5', x: 280, y: 112 },
  { id: 'd6', type: 'defense', label: 'D6', x: 335, y: 65 },
  { id: 'ball', type: 'ball', label: '●', x: 200, y: 202 }
];

const DEFAULT_PIECES_FULL_COURT = [
  { id: 'gk1', type: 'offense', label: 'GK', x: 200, y: 695 },
  { id: 'o1', type: 'offense', label: 'LW', x: 45, y: 480 },
  { id: 'o2', type: 'offense', label: 'LB', x: 115, y: 540 },
  { id: 'o3', type: 'offense', label: 'CB', x: 200, y: 510 },
  { id: 'o4', type: 'offense', label: 'RB', x: 285, y: 540 },
  { id: 'o5', type: 'offense', label: 'RW', x: 355, y: 470 },
  { id: 'o6', type: 'offense', label: 'PV', x: 210, y: 410 },
  { id: 'd1', type: 'defense', label: 'D1', x: 80, y: 450 },
  { id: 'd2', type: 'defense', label: 'D2', x: 145, y: 480 },
  { id: 'd3', type: 'defense', label: 'D3', x: 200, y: 470 },
  { id: 'd4', type: 'defense', label: 'D4', x: 255, y: 480 },
  { id: 'd5', type: 'defense', label: 'D5', x: 320, y: 440 },
  { id: 'd6', type: 'defense', label: 'GK', x: 200, y: 55 },
  { id: 'ball', type: 'ball', label: '●', x: 200, y: 682 }
];

const INITIAL_TACTICS = [
  {
    id: 'tac-j1',
    category: 'junior',
    tacticType: 'オフェンス',
    courtType: 'half',
    title: 'ひろがって パス＆シュート！',
    period: 'あきの チャレンジきかん（10月〜11月）',
    points: [
      'ボールを もっていない ひとが 3ぽ そとに ひろがる！',
      '1か所に かたまらず、ひろい スペースを つかう',
      'パスを もらったら ゴールを みて 3ぽで シュート！'
    ],
    coachMemo: 'みんなが ボールに あつまりすぎると パスが とおらないよ。オクトパスの あしみたいに 8ほうこうに ひろがろう！',
    pieces: [
      { id: 'o1', type: 'offense', label: '1', x: 42, y: 65 },
      { id: 'o2', type: 'offense', label: '2', x: 100, y: 195 },
      { id: 'o3', type: 'offense', label: '3', x: 200, y: 215 },
      { id: 'o4', type: 'offense', label: '4', x: 300, y: 195 },
      { id: 'o5', type: 'offense', label: '5', x: 358, y: 65 },
      { id: 'd1', type: 'defense', label: 'DF', x: 130, y: 120 },
      { id: 'd2', type: 'defense', label: 'DF', x: 200, y: 132 },
      { id: 'd3', type: 'defense', label: 'DF', x: 270, y: 120 },
      { id: 'ball', type: 'ball', label: '●', x: 200, y: 200 }
    ],
    arrows: [
      { id: 'a1', style: 'pass', x1: 200, y1: 210, x2: 112, y2: 196 },
      { id: 'a2', style: 'move', x1: 100, y1: 185, x2: 145, y2: 142 }
    ]
  },
  {
    id: 'tac-s1',
    category: 'senior',
    tacticType: 'オフェンス',
    courtType: 'half',
    title: 'CB-LBクロスからのポスト合わせ',
    period: '秋季公式戦 実践フェーズ（10月〜11月）',
    points: [
      'CBが左斜め前へ仕掛け、D3・D2の意識を中央へ引きつける',
      'LBがCBの背後をクロスしてボールを受け、D2の外側または中央へカットイン',
      'D3がLBのカバーに動いた瞬間、PV（ポスト）へバウンドパスを供給'
    ],
    coachMemo: 'クロスするLBはスピードを落とさず、9mラインを深くえぐる角度で進入すること。',
    pieces: [
      { id: 'o1', type: 'offense', label: 'LW', x: 38, y: 45 },
      { id: 'o2', type: 'offense', label: 'LB', x: 95, y: 200 },
      { id: 'o3', type: 'offense', label: 'CB', x: 200, y: 215 },
      { id: 'o4', type: 'offense', label: 'RW', x: 362, y: 45 },
      { id: 'o5', type: 'offense', label: 'RB', x: 305, y: 195 },
      { id: 'o6', type: 'offense', label: 'PV', x: 215, y: 132 },
      { id: 'd1', type: 'defense', label: 'D1', x: 65, y: 68 },
      { id: 'd2', type: 'defense', label: 'D2', x: 122, y: 112 },
      { id: 'd3', type: 'defense', label: 'D3', x: 180, y: 132 },
      { id: 'd4', type: 'defense', label: 'D4', x: 238, y: 132 },
      { id: 'd5', type: 'defense', label: 'D5', x: 282, y: 112 },
      { id: 'd6', type: 'defense', label: 'D6', x: 335, y: 68 },
      { id: 'ball', type: 'ball', label: '●', x: 200, y: 202 }
    ],
    arrows: [
      { id: 'a1', style: 'move', x1: 195, y1: 210, x2: 145, y2: 165 },
      { id: 'a2', style: 'move', x1: 95, y1: 195, x2: 185, y2: 165 },
      { id: 'a3', style: 'pass', x1: 145, y1: 165, x2: 182, y2: 165 },
      { id: 'a4', style: 'pass', x1: 185, y1: 162, x2: 212, y2: 136 }
    ]
  }
];

const INITIAL_FEEDBACKS = [
  {
    id: 'fb-j1',
    category: 'junior',
    date: '2026-11-08',
    matchType: '練習試合',
    event: 'オクトパス交流戦（vs ブルーキッズ）',
    ourScore: 8,
    opponentScore: 6,
    goodPoints: 'みんな さいごまで あきらめずに ボールを おいかけていました！とくに パスを つないで シュートまで いけた 場面が たくさん ありました。',
    nextSteps: 'ディフェンスのとき、じぶんの マークする あいてを しっかり みて いよう！',
    mvp: '#7 さくら（ナイスキャッチ＆初ゴール！）',
    reactions: { nice: 12, fight: 8, star: 10 },
    createdAt: 1731050000000
  }
];

// ==========================================
// オクトパス・エンブレム SVG
// ==========================================
const OctopusEmblem = ({ isJunior }) => (
  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="20"
      cy="20"
      r="18"
      fill={isJunior ? '#FFF7ED' : '#0F172A'}
      stroke={isJunior ? '#EA580C' : '#38BDF8'}
      strokeWidth="2.5"
    />
    <path
      d="M7 13C11 15 13 25 7 27M33 13C29 15 27 25 33 27"
      stroke={isJunior ? '#FDBA74' : '#1E3A8A'}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 17C12 12.0294 15.5817 8 20 8C24.4183 8 28 12.0294 28 17C28 20.5 26.2 22.8 24 23.5H16C13.8 22.8 12 20.5 12 17Z"
      fill={isJunior ? '#EA580C' : '#F97316'}
    />
    <path d="M15.2 16.2L18.5 17.5L15.2 18.6Z" fill="#FFFFFF" />
    <path d="M24.8 16.2L21.5 17.5L24.8 18.6Z" fill="#FFFFFF" />
    <path d="M14 23.5C12 26 9.5 26.5 8.5 25" stroke={isJunior ? '#EA580C' : '#F97316'} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M16.5 23.5C15 27.5 13 29.5 11 29.5" stroke={isJunior ? '#EA580C' : '#F97316'} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M19 23.5C18.5 28 17.5 31 16 32" stroke={isJunior ? '#EA580C' : '#F97316'} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M21 23.5C21.5 28 22.5 31 24 32" stroke={isJunior ? '#EA580C' : '#F97316'} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M23.5 23.5C25 27.5 27 29.5 29 29.5" stroke={isJunior ? '#EA580C' : '#F97316'} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M26 23.5C28 26 30.5 26.5 31.5 25" stroke={isJunior ? '#EA580C' : '#F97316'} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const Ruby = ({ base, reading }) => (
  <ruby className="ruby-align">
    {base}
    <rt className="text-[10px] font-normal text-current opacity-85 select-none">{reading}</rt>
  </ruby>
);

// ==========================================
// ハンドボール正規コート作戦ボード
// ==========================================
const HandballCourtBoard = ({
  pieces = [],
  arrows = [],
  courtType = 'half',
  editable = false,
  onChange
}) => {
  const svgRef = useRef(null);
  const [toolMode, setToolMode] = useState('move');
  const [draggingId, setDraggingId] = useState(null);
  const [drawingArrow, setDrawingArrow] = useState(null);

  const isFullCourt = courtType === 'full';
  const vbWidth = 400;
  const vbHeight = isFullCourt ? 760 : 385;

  const getSvgCoords = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 200, y: vbHeight / 2 };
    const rect = svg.getBoundingClientRect();
    const x = Math.max(15, Math.min(vbWidth - 15, ((clientX - rect.left) / rect.width) * vbWidth));
    const y = Math.max(15, Math.min(vbHeight - 15, ((clientY - rect.top) / rect.height) * vbHeight));
    return { x: Math.round(x), y: Math.round(y) };
  };

  const handlePiecePointerDown = (e, pieceId) => {
    if (!editable || toolMode !== 'move') return;
    e.stopPropagation();
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDraggingId(pieceId);
  };

  const handleBoardPointerDown = (e) => {
    if (!editable || toolMode === 'move') return;
    const coords = getSvgCoords(e.clientX, e.clientY);
    setDrawingArrow({
      id: `arrow-${Date.now()}`,
      style: toolMode === 'pass' ? 'pass' : 'move',
      x1: coords.x,
      y1: coords.y,
      x2: coords.x,
      y2: coords.y
    });
  };

  const handleBoardPointerMove = (e) => {
    if (!editable) return;
    if (draggingId && toolMode === 'move') {
      const coords = getSvgCoords(e.clientX, e.clientY);
      const nextPieces = pieces.map((p) =>
        p.id === draggingId ? { ...p, x: coords.x, y: coords.y } : p
      );
      if (onChange) onChange({ pieces: nextPieces, arrows });
    } else if (drawingArrow && toolMode !== 'move') {
      const coords = getSvgCoords(e.clientX, e.clientY);
      setDrawingArrow((prev) => (prev ? { ...prev, x2: coords.x, y2: coords.y } : null));
    }
  };

  const handleBoardPointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
    if (drawingArrow) {
      const dist = Math.hypot(drawingArrow.x2 - drawingArrow.x1, drawingArrow.y2 - drawingArrow.y1);
      if (dist > 14 && onChange) {
        onChange({ pieces, arrows: [...arrows, drawingArrow] });
      }
      setDrawingArrow(null);
    }
  };

  const handleUndoArrow = () => {
    if (arrows.length === 0 || !onChange) return;
    onChange({ pieces, arrows: arrows.slice(0, -1) });
  };

  const handleClearArrows = () => {
    if (!onChange) return;
    onChange({ pieces, arrows: [] });
  };

  const handleResetFormation = () => {
    if (!onChange) return;
    const preset = isFullCourt ? DEFAULT_PIECES_FULL_COURT : DEFAULT_PIECES_OFFENSE;
    onChange({ pieces: JSON.parse(JSON.stringify(preset)), arrows: [] });
  };

  const renderArrowElement = (arrow, isPreview = false) => {
    const dx = arrow.x2 - arrow.x1;
    const dy = arrow.y2 - arrow.y1;
    const angle = Math.atan2(dy, dx);
    const headLen = 10;
    const ax1 = arrow.x2 - headLen * Math.cos(angle - Math.PI / 6);
    const ay1 = arrow.y2 - headLen * Math.sin(angle - Math.PI / 6);
    const ax2 = arrow.x2 - headLen * Math.cos(angle + Math.PI / 6);
    const ay2 = arrow.y2 - headLen * Math.sin(angle + Math.PI / 6);

    const isPass = arrow.style === 'pass';
    const strokeColor = isPass ? '#FACC15' : '#FFFFFF';

    return (
      <g key={arrow.id} opacity={isPreview ? 0.75 : 0.95}>
        <line
          x1={arrow.x1}
          y1={arrow.y1}
          x2={arrow.x2}
          y2={arrow.y2}
          stroke={strokeColor}
          strokeWidth="2.8"
          strokeDasharray={isPass ? '6 4' : 'none'}
          strokeLinecap="round"
        />
        <polygon
          points={`${arrow.x2},${arrow.y2} ${ax1},${ay1} ${ax2},${ay2}`}
          fill={strokeColor}
        />
      </g>
    );
  };

  const renderGoalEndLines = (isBottom = false) => {
    const glY = isBottom ? 745 : 15;
    const dir = isBottom ? -1 : 1;

    const sixArcSweep = isBottom ? 1 : 0;
    const sixEndY = glY + 108 * dir;
    const sixPath = `M 65 ${glY} A 108 108 0 0 ${sixArcSweep} 173 ${sixEndY} L 227 ${sixEndY} A 108 108 0 0 ${sixArcSweep} 335 ${glY}`;
    const sixFillPath = `${sixPath} Z`;

    const nineSideY = glY + 53 * dir;
    const nineFrontY = glY + 162 * dir;
    const ninePath = `M 20 ${nineSideY} A 162 162 0 0 ${sixArcSweep} 173 ${nineFrontY} L 227 ${nineFrontY} A 162 162 0 0 ${sixArcSweep} 380 ${nineSideY}`;

    const sevenY = glY + 126 * dir;
    const fourY = glY + 72 * dir;
    const goalBoxY = isBottom ? glY : glY - 11;

    return (
      <g>
        <path d={sixFillPath} fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2.4" />
        <path
          d={ninePath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
        <line x1="191" y1={sevenY} x2="209" y2={sevenY} stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="196" y1={fourY} x2="204" y2={fourY} stroke="#FFFFFF" strokeWidth="2.2" />
        <rect
          x="173"
          y={goalBoxY}
          width="54"
          height="11"
          fill="#EF4444"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </g>
    );
  };

  return (
    <div className="space-y-2.5">
      {editable && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setToolMode('move')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                toolMode === 'move'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>コマ移動</span>
            </button>

            <button
              type="button"
              onClick={() => setToolMode('run')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                toolMode === 'run'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>動き矢印（実線）</span>
            </button>

            <button
              type="button"
              onClick={() => setToolMode('pass')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                toolMode === 'pass'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CornerUpRight className="w-3.5 h-3.5" />
              <span>パス矢印（点線）</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndoArrow}
              disabled={arrows.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>1つ戻す</span>
            </button>
            <button
              type="button"
              onClick={handleClearArrows}
              disabled={arrows.length === 0}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-600 border border-slate-200 disabled:opacity-40 hover:bg-rose-50"
            >
              矢印全消去
            </button>
            <button
              type="button"
              onClick={handleResetFormation}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            >
              初期配置
            </button>
          </div>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner bg-blue-900 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className={`w-full h-auto block mx-auto ${
            isFullCourt ? 'max-w-[360px]' : ''
          } ${editable ? 'touch-none cursor-crosshair' : ''}`}
          onPointerDown={handleBoardPointerDown}
          onPointerMove={handleBoardPointerMove}
          onPointerUp={handleBoardPointerUp}
        >
          <rect x="0" y="0" width={vbWidth} height={vbHeight} fill="#1E3A8A" />
          <rect
            x="20"
            y="15"
            width="360"
            height={isFullCourt ? 730 : 360}
            fill="#2563EB"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />

          {isFullCourt && (
            <>
              <line x1="20" y1="380" x2="380" y2="380" stroke="#FFFFFF" strokeWidth="2.2" />
              <circle cx="200" cy="380" r="4" fill="#FFFFFF" />
            </>
          )}

          {renderGoalEndLines(false)}
          {isFullCourt && renderGoalEndLines(true)}

          {arrows.map((arrow) => renderArrowElement(arrow, false))}
          {drawingArrow && renderArrowElement(drawingArrow, true)}

          {pieces.map((piece) => {
            const isOffense = piece.type === 'offense';
            const isBall = piece.type === 'ball';

            return (
              <g
                key={piece.id}
                transform={`translate(${piece.x}, ${piece.y})`}
                onPointerDown={(e) => handlePiecePointerDown(e, piece.id)}
                className={editable && toolMode === 'move' ? 'cursor-grab active:cursor-grabbing' : ''}
              >
                {isBall ? (
                  <>
                    <circle r="8.5" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                    <circle r="3" fill="#FEF08A" cx="-2" cy="-2" />
                  </>
                ) : (
                  <>
                    <circle
                      r="13.5"
                      fill={isOffense ? '#F97316' : '#0F172A'}
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      {piece.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        <div className="bg-slate-950/90 text-white px-3 py-1.5 text-[11px] font-bold flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-white inline-block" />
              <span>オフェンス</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-slate-900 border border-white inline-block" />
              <span>ディフェンス</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
              <span>ボール</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span>{isFullCourt ? 'オールコート(20×40m)' : 'ハーフコート(正規寸法)'}</span>
            <span>━ 動き / ┅ パス</span>
          </div>
        </div>
      </div>
    </div>
  );
};

  const firebaseConfig = {
  apiKey: "AIzaSyAnK9vu2welqpet97PfS-zrRJISN-7fl-8",
  authDomain: "octopus-test-tm-app.firebaseapp.com",
  projectId: "octopus-test-tm-app",
  storageBucket: "octopus-test-tm-app.firebasestorage.app",
  messagingSenderId: "219868940737",
  appId: "1:219868940737:web:b27fc3d30d5522a6488740",
};


// ==========================================
// メインアプリケーション
// ==========================================
function App() {
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'octopus-handball-v2';
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);

  const [category, setCategory] = useState('junior');
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [goalsData, setGoalsData] = useState(INITIAL_GOALS);
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [tactics, setTactics] = useState(INITIAL_TACTICS);
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);

  const [selectedSeasonIdMap, setSelectedSeasonIdMap] = useState({
    junior: 'js-1',
    senior: 'ss-1'
  });

  const [tacticFilter, setTacticFilter] = useState('ALL');

  const [editingGoalField, setEditingGoalField] = useState(null);
  const [goalInputText, setGoalInputText] = useState('');

  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [editingSeasonObj, setEditingSeasonObj] = useState(null);
  const [seasonForm, setSeasonForm] = useState({
    title: '',
    period: '',
    goal: ''
  });

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({
    number: '',
    name: '',
    position: 'フローター',
    goal: '',
    progress: 3,
    metric: '',
    stampType: 'none',
    coachNote: ''
  });

  const [showTacticModal, setShowTacticModal] = useState(false);
  const [editingTactic, setEditingTactic] = useState(null);
  const [tacticForm, setTacticForm] = useState({
    tacticType: 'オフェンス',
    courtType: 'half',
    title: '',
    period: '',
    pointsText: '',
    coachMemo: '',
    pieces: DEFAULT_PIECES_OFFENSE,
    arrows: []
  });

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState({
    date: new Date().toISOString().split('T')[0],
    matchType: '練習試合',
    event: '',
    ourScore: '',
    opponentScore: '',
    goodPoints: '',
    nextSteps: '',
    mvp: ''
  });

  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [bulkPlayersDraft, setBulkPlayersDraft] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Firebase 初期化＆認証（RULE 3 準拠）
  useEffect(() => {
    if (!firebaseConfig) return;
    try {
      const appInstance = initializeApp(firebaseConfig);
      const authInstance = getAuth(appInstance);
      const dbInstance = getFirestore(appInstance);
      setDb(dbInstance);

      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(authInstance, __initial_auth_token);
          } else {
            await signInAnonymously(authInstance);
          }
        } catch (err) {
          console.error('Auth error:', err);
          try {
            await signInAnonymously(authInstance);
          } catch (e) {
            console.error('Fallback auth error:', e);
          }
        }
      };

      initAuth();

      const unsubscribeAuth = onAuthStateChanged(authInstance, (currentUser) => {
        setUser(currentUser);
      });

      return () => unsubscribeAuth();
    } catch (e) {
      console.error('Firebase init failed:', e);
    }
  }, []);

  // Firestore リアルタイムリスナー（RULE 1・RULE 2・エラーコールバック準拠）
  useEffect(() => {
    if (!db || !user) return;

    const docRefGoals = doc(db, 'artifacts', appId, 'public', 'data', 'team_config', 'goals');
    const unsubGoals = onSnapshot(
      docRefGoals,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.payload) {
            setGoalsData(data.payload);
          }
        } else {
          setDoc(docRefGoals, { payload: INITIAL_GOALS }).catch((e) => console.error(e));
        }
      },
      (err) => console.error('Goals sync error:', err)
    );

    const colRefPlayers = collection(db, 'artifacts', appId, 'public', 'data', 'players_list');
    const unsubPlayers = onSnapshot(
      colRefPlayers,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((d) => {
            const val = d.data();
            if (!val.deleted) {
              list.push({ id: d.id, ...val });
            }
          });
          if (list.length > 0) {
            setPlayers(list);
          }
        } else {
          INITIAL_PLAYERS.forEach((p) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players_list', p.id), p).catch((e) =>
              console.error(e)
            );
          });
        }
      },
      (err) => console.error('Players sync error:', err)
    );

    const colRefTactics = collection(db, 'artifacts', appId, 'public', 'data', 'tactics_list');
    const unsubTactics = onSnapshot(
      colRefTactics,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((d) => {
            const val = d.data();
            if (!val.deleted) {
              list.push({ id: d.id, ...val });
            }
          });
          if (list.length > 0) {
            setTactics(list);
          }
        } else {
          INITIAL_TACTICS.forEach((t) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tactics_list', t.id), t).catch((e) =>
              console.error(e)
            );
          });
        }
      },
      (err) => console.error('Tactics sync error:', err)
    );

    const colRefFeedbacks = collection(db, 'artifacts', appId, 'public', 'data', 'feedbacks_list');
    const unsubFeedbacks = onSnapshot(
      colRefFeedbacks,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach((d) => {
            const val = d.data();
            if (!val.deleted) {
              list.push({ id: d.id, ...val });
            }
          });
          if (list.length > 0) {
            setFeedbacks(list);
          }
        } else {
          INITIAL_FEEDBACKS.forEach((f) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'feedbacks_list', f.id), f).catch(
              (e) => console.error(e)
            );
          });
        }
      },
      (err) => console.error('Feedbacks sync error:', err)
    );

    return () => {
      unsubGoals();
      unsubPlayers();
      unsubTactics();
      unsubFeedbacks();
    };
  }, [db, user, appId]);

  const isJunior = category === 'junior';
  const currentGoals = goalsData[category] || INITIAL_GOALS[category];
  const seasonList = currentGoals.seasons || [];

  const activeSeasonObj = useMemo(() => {
    const targetId = selectedSeasonIdMap[category];
    return seasonList.find((s) => s.id === targetId) || seasonList[0] || null;
  }, [seasonList, selectedSeasonIdMap, category]);

  const filteredPlayers = useMemo(
    () =>
      players
        .filter((p) => p.category === category)
        .sort((a, b) => Number(a.number) - Number(b.number)),
    [players, category]
  );

  const filteredTactics = useMemo(() => {
    return tactics.filter((t) => {
      if (t.category !== category) return false;
      if (tacticFilter !== 'ALL' && t.tacticType !== tacticFilter) return false;
      return true;
    });
  }, [tactics, category, tacticFilter]);

  const filteredFeedbacks = useMemo(
    () =>
      feedbacks
        .filter((f) => f.category === category)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0)),
    [feedbacks, category]
  );

  // ==========================================
  // クラウド保存ヘルパー
  // ==========================================
  const saveGoalsToCloud = async (nextGoals) => {
    setGoalsData(nextGoals);
    if (!db || !user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_config', 'goals'), {
        payload: nextGoals
      });
    } catch (e) {
      console.error(e);
    }
  };

  const savePlayerToCloud = async (playerObj) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === playerObj.id);
      return exists ? prev.map((p) => (p.id === playerObj.id ? playerObj : p)) : [...prev, playerObj];
    });
    if (!db || !user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players_list', playerObj.id), playerObj);
    } catch (e) {
      console.error(e);
    }
  };

  const deletePlayerFromCloud = async (playerId) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players_list', playerId));
    } catch (e) {
      console.error(e);
    }
  };

  const saveTacticToCloud = async (tacticObj) => {
    setTactics((prev) => {
      const exists = prev.some((t) => t.id === tacticObj.id);
      return exists ? prev.map((t) => (t.id === tacticObj.id ? tacticObj : t)) : [tacticObj, ...prev];
    });
    if (!db || !user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tactics_list', tacticObj.id), tacticObj);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTacticFromCloud = async (tacticId) => {
    setTactics((prev) => prev.filter((t) => t.id !== tacticId));
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tactics_list', tacticId));
    } catch (e) {
      console.error(e);
    }
  };

  const saveFeedbackToCloud = async (fbObj) => {
    setFeedbacks((prev) => {
      const exists = prev.some((f) => f.id === fbObj.id);
      return exists ? prev.map((f) => (f.id === fbObj.id ? fbObj : f)) : [fbObj, ...prev];
    });
    if (!db || !user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'feedbacks_list', fbObj.id), fbObj);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFeedbackFromCloud = async (fbId) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== fbId));
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'feedbacks_list', fbId));
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // ハンドラ
  // ==========================================
  const startEditGoal = (field) => {
    setEditingGoalField(field);
    if (field === 'slogan') setGoalInputText(currentGoals.slogan);
    if (field === 'longTerm') setGoalInputText(currentGoals.longTerm);
    if (field === 'categorySubtitle') setGoalInputText(currentGoals.categorySubtitle || '');
  };

  const saveGoalEdit = () => {
    if (!editingGoalField) return;
    const nextGoals = JSON.parse(JSON.stringify(goalsData));
    if (!nextGoals[category]) nextGoals[category] = { ...INITIAL_GOALS[category] };
    nextGoals[category][editingGoalField] = goalInputText;
    saveGoalsToCloud(nextGoals);
    setEditingGoalField(null);
    showToast('チーム目標を更新し全員に共有しました！');
  };

  const openSeasonModal = (season = null) => {
    if (season) {
      setEditingSeasonObj(season);
      setSeasonForm({
        title: season.title,
        period: season.period,
        goal: season.goal
      });
    } else {
      setEditingSeasonObj(null);
      setSeasonForm({
        title: isJunior ? 'あたらしい チャレンジきかん' : '新シーズン重点目標',
        period: '2026年11月〜12月（2ヶ月間）',
        goal: ''
      });
    }
    setShowSeasonModal(true);
  };

  const saveSeasonGoal = (e) => {
    e.preventDefault();
    if (!seasonForm.title.trim() || !seasonForm.goal.trim()) return;

    const nextGoals = JSON.parse(JSON.stringify(goalsData));
    const list = nextGoals[category].seasons || [];
    if (editingSeasonObj) {
      nextGoals[category].seasons = list.map((s) =>
        s.id === editingSeasonObj.id
          ? {
              ...s,
              title: seasonForm.title.trim(),
              period: seasonForm.period.trim() || '期間未設定',
              goal: seasonForm.goal.trim()
            }
          : s
      );
    } else {
      const newId = `season-${Date.now()}`;
      nextGoals[category].seasons = [
        ...list,
        {
          id: newId,
          title: seasonForm.title.trim(),
          period: seasonForm.period.trim() || '期間未設定',
          goal: seasonForm.goal.trim(),
          isActive: true
        }
      ];
      setSelectedSeasonIdMap((m) => ({ ...m, [category]: newId }));
    }

    saveGoalsToCloud(nextGoals);
    setShowSeasonModal(false);
    showToast('期間と目標を更新し全員に共有しました！');
  };

  const deleteSeasonGoal = (seasonId) => {
    if (seasonList.length <= 1) {
      showToast('最低1つのシーズン目標が必要です');
      return;
    }
    const nextGoals = JSON.parse(JSON.stringify(goalsData));
    const filtered = (nextGoals[category].seasons || []).filter((s) => s.id !== seasonId);
    nextGoals[category].seasons = filtered;
    if (selectedSeasonIdMap[category] === seasonId && filtered[0]) {
      setSelectedSeasonIdMap((m) => ({ ...m, [category]: filtered[0].id }));
    }
    saveGoalsToCloud(nextGoals);
    showToast('シーズン目標を削除しました');
  };

  const openPlayerModal = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({
        number: player.number,
        name: player.name,
        position: player.position,
        goal: player.goal,
        progress: player.progress || 3,
        metric: player.metric || '',
        stampType: player.stampType || 'none',
        coachNote: player.coachNote || ''
      });
    } else {
      setEditingPlayer(null);
      setPlayerForm({
        number: '',
        name: '',
        position: isJunior ? 'フローター' : 'センター (CB)',
        goal: '',
        progress: 3,
        metric: '',
        stampType: 'none',
        coachNote: ''
      });
    }
    setShowPlayerModal(true);
  };

  const savePlayer = (e) => {
    e.preventDefault();
    if (!playerForm.name.trim()) return;

    const payload = {
      id: editingPlayer ? editingPlayer.id : `p-${Date.now()}`,
      category,
      number: Number(playerForm.number) || 0,
      name: playerForm.name.trim(),
      position: playerForm.position,
      goal: playerForm.goal.trim(),
      progress: Number(playerForm.progress),
      metric: playerForm.metric.trim(),
      stampType: playerForm.stampType,
      coachNote: playerForm.coachNote.trim()
    };

    savePlayerToCloud(payload);
    setShowPlayerModal(false);
    showToast(editingPlayer ? '選手データを更新しました！' : '新しい選手を追加しました！');
  };

  const updatePlayerProgress = (player, newProgress) => {
    if (!isCoachMode) return;
    const nextStamp = newProgress === 5 && player.stampType === 'none' ? 'hanamaru' : player.stampType;
    const updated = { ...player, progress: newProgress, stampType: nextStamp };
    savePlayerToCloud(updated);
    showToast(`${player.name} の達成度を更新しました！`);
  };

  const cyclePlayerStamp = (player) => {
    if (!isCoachMode) return;
    const order = ['none', 'hanamaru', 'fight'];
    const nextIdx = (order.indexOf(player.stampType || 'none') + 1) % order.length;
    const nextStamp = order[nextIdx];
    const updated = { ...player, stampType: nextStamp };
    savePlayerToCloud(updated);
    showToast('応援スタンプを更新しました！');
  };

  const deletePlayer = (playerId) => {
    if (!isCoachMode) return;
    deletePlayerFromCloud(playerId);
    showToast('選手データを削除しました');
  };

  const openTacticModal = (tactic = null) => {
    if (tactic) {
      setEditingTactic(tactic);
      setTacticForm({
        tacticType: tactic.tacticType,
        courtType: tactic.courtType || 'half',
        title: tactic.title,
        period: tactic.period || '',
        pointsText: (tactic.points || []).join('\n'),
        coachMemo: tactic.coachMemo || '',
        pieces: tactic.pieces || DEFAULT_PIECES_OFFENSE,
        arrows: tactic.arrows || []
      });
    } else {
      setEditingTactic(null);
      setTacticForm({
        tacticType: 'オフェンス',
        courtType: 'half',
        title: '',
        period: activeSeasonObj ? `${activeSeasonObj.title}（${activeSeasonObj.period}）` : '',
        pointsText: '',
        coachMemo: '',
        pieces: JSON.parse(JSON.stringify(DEFAULT_PIECES_OFFENSE)),
        arrows: []
      });
    }
    setShowTacticModal(true);
  };

  const handleCourtTypeChange = (nextCourtType) => {
    if (tacticForm.courtType === nextCourtType) return;
    const presetPieces =
      nextCourtType === 'full' ? DEFAULT_PIECES_FULL_COURT : DEFAULT_PIECES_OFFENSE;
    setTacticForm((prev) => ({
      ...prev,
      courtType: nextCourtType,
      pieces: JSON.parse(JSON.stringify(presetPieces)),
      arrows: []
    }));
  };

  const saveTactic = (e) => {
    e.preventDefault();
    if (!tacticForm.title.trim()) return;

    const pointsArray = tacticForm.pointsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      id: editingTactic ? editingTactic.id : `tac-${Date.now()}`,
      category,
      tacticType: tacticForm.tacticType,
      courtType: tacticForm.courtType || 'half',
      title: tacticForm.title.trim(),
      period: tacticForm.period.trim(),
      points: pointsArray,
      coachMemo: tacticForm.coachMemo.trim(),
      pieces: tacticForm.pieces,
      arrows: tacticForm.arrows
    };

    saveTacticToCloud(payload);
    setShowTacticModal(false);
    showToast('戦術・フォーメーションを保存し共有しました！');
  };

  const deleteTactic = (tacticId) => {
    if (!isCoachMode) return;
    deleteTacticFromCloud(tacticId);
    showToast('戦術データを削除しました');
  };

  const saveMatchFeedback = (e) => {
    e.preventDefault();
    if (!matchForm.event.trim()) return;

    const payload = {
      id: `fb-${Date.now()}`,
      category,
      date: matchForm.date,
      matchType: matchForm.matchType,
      event: matchForm.event.trim(),
      ourScore: Number(matchForm.ourScore) || 0,
      opponentScore: Number(matchForm.opponentScore) || 0,
      goodPoints: matchForm.goodPoints.trim(),
      nextSteps: matchForm.nextSteps.trim(),
      mvp: matchForm.mvp.trim(),
      reactions: { nice: 0, fight: 0, star: 0 },
      createdAt: Date.now()
    };

    saveFeedbackToCloud(payload);
    setShowMatchModal(false);
    setMatchForm({
      date: new Date().toISOString().split('T')[0],
      matchType: '練習試合',
      event: '',
      ourScore: '',
      opponentScore: '',
      goodPoints: '',
      nextSteps: '',
      mvp: ''
    });
    showToast('試合フィードバックを投稿しました！');
  };

  const handleReaction = (fbId, type) => {
    const target = feedbacks.find((f) => f.id === fbId);
    if (!target) return;
    const currentCount = target.reactions?.[type] || 0;
    const updated = {
      ...target,
      reactions: {
        ...(target.reactions || { nice: 0, fight: 0, star: 0 }),
        [type]: currentCount + 1
      }
    };
    saveFeedbackToCloud(updated);
  };

  const deleteFeedback = (fbId) => {
    if (!isCoachMode) return;
    deleteFeedbackFromCloud(fbId);
    showToast('試合記録を削除しました');
  };

  // ==========================================
  // 選手一括編集
  // ==========================================
  const syncBulkDraft = (targetCategory = category, sourcePlayers = players) => {
    const list = sourcePlayers
      .filter((p) => p.category === targetCategory)
      .sort((a, b) => Number(a.number) - Number(b.number))
      .map((p) => ({ ...p }));
    setBulkPlayersDraft(list);
  };

  useEffect(() => {
    if (activeTab === 'bulkPlayers') {
      syncBulkDraft(category, players);
    }
  }, [activeTab, category]);

  const handleBulkFieldChange = (id, field, value) => {
    setBulkPlayersDraft((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleBulkSortByNumber = () => {
    setBulkPlayersDraft((prev) =>
      [...prev].sort((a, b) => Number(a.number || 0) - Number(b.number || 0))
    );
    showToast('背番号順に並び替えました');
  };

  const handleBulkAddRow = () => {
    const maxNum = bulkPlayersDraft.reduce(
      (max, p) => Math.max(max, Number(p.number) || 0),
      0
    );
    const newRow = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      number: maxNum + 1,
      name: '',
      position: isJunior ? 'フローター' : 'センター (CB)',
      goal: '',
      progress: 3,
      metric: '',
      stampType: 'none',
      coachNote: ''
    };
    setBulkPlayersDraft((prev) => [...prev, newRow]);
  };

  const handleBulkRemoveRow = (id) => {
    setBulkPlayersDraft((prev) => prev.filter((item) => item.id !== id));
    deletePlayerFromCloud(id);
  };

  const handleBulkSaveAll = async () => {
    const validRows = bulkPlayersDraft
      .filter((p) => p.name && p.name.trim() !== '')
      .map((p) => ({
        ...p,
        category,
        number: Number(p.number) || 0,
        name: p.name.trim(),
        goal: (p.goal || '').trim(),
        metric: (p.metric || '').trim(),
        coachNote: (p.coachNote || '').trim(),
        progress: Number(p.progress) || 3,
        stampType: p.stampType || 'none'
      }))
      .sort((a, b) => a.number - b.number);

    for (const p of validRows) {
      await savePlayerToCloud(p);
    }
    showToast(`選手 ${validRows.length}名のデータを一括保存し全員に同期しました！`);
  };

  const navigateToTab = (tabName) => {
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        isJunior ? 'bg-slate-50 text-slate-900' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/15 flex items-center gap-2 text-xs sm:text-sm font-bold whitespace-nowrap animate-bounce">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
          スリムヘッダー（iPhone最適化・クラウド同期表示＆ホーム追加ガイド）
          ========================================== */}
      <header
        className={`sticky top-0 z-30 shadow-md border-b-2 transition-colors duration-300 ${
          isJunior
            ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 border-slate-950 text-white'
            : 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-orange-500 text-white'
        }`}
      >
        <div className="max-w-xl mx-auto px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              type="button"
              onClick={() => navigateToTab('home')}
              className="flex items-center gap-2 text-left active:opacity-80 transition min-w-0"
            >
              <div className="p-1 rounded-xl bg-white/15 backdrop-blur-xs shrink-0">
                <OctopusEmblem isJunior={isJunior} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-xs inline-block leading-none ${
                      isJunior ? 'bg-slate-950 text-orange-400' : 'bg-orange-500 text-white'
                    }`}
                  >
                    OCTOPUS HC
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>最新同期</span>
                  </span>
                </div>
                <h1 className="font-black text-base tracking-tight leading-tight mt-0.5 flex items-center gap-1.5 truncate">
                  <span>オクトパス</span>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                      isJunior
                        ? 'bg-white text-orange-600'
                        : 'bg-blue-900 text-sky-300 border border-sky-400/30'
                    }`}
                  >
                    {isJunior ? '低学年' : '高学年'}
                  </span>
                </h1>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPwaGuide(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-black bg-white/20 hover:bg-white/30 text-white border border-white/25 transition"
                title="iPhoneのホーム画面に追加する方法"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>ホーム追加</span>
              </button>

              <button
                onClick={() => setIsCoachMode(!isCoachMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  isCoachMode
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-white shadow-sm'
                    : 'bg-black/30 hover:bg-black/40 text-white border border-white/25'
                }`}
              >
                {isCoachMode ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>監督ON</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>閲覧</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-black/25 p-1 rounded-xl">
            <button
              onClick={() => {
                setCategory('junior');
                setTacticFilter('ALL');
              }}
              className={`py-1.5 px-2.5 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                isJunior
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isJunior ? 'bg-orange-600' : 'bg-orange-400'
                }`}
              />
              <span>低学年</span>
            </button>

            <button
              onClick={() => {
                setCategory('senior');
                setTacticFilter('ALL');
              }}
              className={`py-1.5 px-2.5 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                !isJunior
                  ? 'bg-slate-950 text-white ring-1 ring-sky-400 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  !isJunior ? 'bg-sky-400' : 'bg-blue-900 ring-1 ring-white/50'
                }`}
              />
              <span>高学年</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          メインコンテンツエリア（iPhone幅最適化：max-w-xl）
          ========================================== */}
      <main className="max-w-xl mx-auto px-3.5 pt-4 space-y-4">
        {activeTab !== 'home' && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToTab('home')}
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-950 bg-white px-3 py-1.5 rounded-full shadow-2xs border border-slate-200 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ホームへもどる</span>
            </button>

            <span
              className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                isJunior ? 'bg-orange-100 text-orange-700' : 'bg-blue-950 text-sky-300'
              }`}
            >
              {isJunior ? 'オクトパス 低学年' : 'オクトパス 高学年'}
            </span>
          </div>
        )}

        {isCoachMode && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 p-2 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-black text-amber-900 px-2 shrink-0">
              監督ツール：
            </span>
            <button
              type="button"
              onClick={() => navigateToTab('bulkPlayers')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeTab === 'bulkPlayers'
                  ? 'bg-slate-950 text-amber-400 shadow-xs'
                  : 'bg-white text-slate-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <ListChecks className="w-4 h-4 shrink-0" />
              <span>選手一括編集（番号順・追加）</span>
            </button>
          </div>
        )}

        {/* ==========================================
            HOME: シンプル＆スタイリッシュランチャー
            ========================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <section
              className={`relative overflow-hidden rounded-3xl p-5 shadow-lg border-l-8 ${
                isJunior
                  ? 'bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 border-slate-950 text-white'
                  : 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border-orange-500 text-white'
              }`}
            >
              <div className="absolute -right-5 -bottom-5 opacity-10 pointer-events-none">
                <Trophy className="w-32 h-32" />
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-xs -skew-x-6 uppercase ${
                      isJunior ? 'bg-slate-950 text-orange-400' : 'bg-orange-500 text-white'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    {isJunior ? 'TEAM SLOGAN / 低学年' : 'TEAM SLOGAN / 高学年'}
                  </span>

                  {isCoachMode && (
                    <button
                      onClick={() => startEditGoal('slogan')}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>編集</span>
                    </button>
                  )}
                </div>

                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
                  「{currentGoals.slogan}」
                </h2>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs font-bold text-white/85">
                    {currentGoals.categorySubtitle}
                  </p>
                  {isCoachMode && (
                    <button
                      onClick={() => startEditGoal('categorySubtitle')}
                      className="text-[10px] font-bold underline text-white/80 hover:text-white"
                    >
                      サブ文編集
                    </button>
                  )}
                </div>
              </div>
            </section>

            {activeSeasonObj && (
              <button
                type="button"
                onClick={() => navigateToTab('goals')}
                className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-[0.99] transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isJunior ? 'bg-orange-100 text-orange-700' : 'bg-blue-950 text-sky-300'
                      }`}
                    >
                      {isJunior ? 'いまの 重点テーマ' : 'CURRENT FOCUS'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      {activeSeasonObj.period}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {activeSeasonObj.goal}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            )}

            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-500">
                  {isJunior ? 'みたい 項目を タップしよう' : 'MENU / 見たい項目を選択'}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigateToTab('goals')}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                        isJunior ? 'bg-orange-600' : 'bg-blue-950'
                      }`}
                    >
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">
                          {isJunior ? 'チームの もくひょう' : 'チーム・中期目標'}
                        </span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {seasonList.length}期間
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {isJunior
                          ? '1ねんの ゴールと きかんごとの もくひょう'
                          : '年間長期目標・シーズン期間別の重点テーマ'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('players')}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                        isJunior ? 'bg-amber-500' : 'bg-indigo-900'
                      }`}
                    >
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">
                          {isJunior ? 'みんなの 個人もくひょう' : '選手別・個人目標'}
                        </span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {filteredPlayers.length}{isJunior ? 'にん' : '名'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {isJunior
                          ? 'ひとりひとりの やくそくと がんばりスター'
                          : '個人フォーカス目標・達成度・監督コメント'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('tactics')}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isJunior ? 'bg-slate-900 text-orange-400' : 'bg-sky-500 text-slate-950'
                      }`}
                    >
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">
                          {isJunior ? 'さくせん・フォーメーション' : '戦術・フォーメーション'}
                        </span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {filteredTactics.length}件
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {isJunior
                          ? 'コートの うごきと パスの 作戦ボード'
                          : 'オフェンス・ディフェンス・速攻作戦ボード'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('matches')}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                        isJunior ? 'bg-emerald-600' : 'bg-orange-600'
                      }`}
                    >
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">
                          {isJunior ? 'しあいの ふりかえり' : '試合フィードバック'}
                        </span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {filteredFeedbacks.length}試合
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {isJunior
                          ? 'よかったところ・MVP・おうえんスタンプ'
                          : '試合結果・グッドポイント・次の課題共有'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </button>

                {isCoachMode && (
                  <button
                    type="button"
                    onClick={() => navigateToTab('bulkPlayers')}
                    className="w-full bg-amber-50 rounded-2xl p-4 shadow-sm border-2 border-amber-400 hover:bg-amber-100/70 active:scale-[0.99] transition flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                        <ListChecks className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-slate-950">
                            選手の一括編集・追加
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            監督専用
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-bold truncate mt-0.5">
                          背番号順に並べて目標・達成度・コメントを一括編集＆新規追加
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 shrink-0" />
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ==========================================
            TAB 1: チーム・中期目標
            ========================================== */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div
              className={`rounded-3xl p-4 sm:p-5 shadow-sm border-2 bg-white ${
                isJunior ? 'border-orange-300' : 'border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-sm ${
                      isJunior ? 'bg-orange-600' : 'bg-blue-950'
                    }`}
                  >
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider block ${
                        isJunior ? 'text-orange-600' : 'text-blue-900'
                      }`}
                    >
                      {isJunior ? 'STEP 1 ★ 1ねんかんの ゴール' : 'STEP 1 / 1年間の長期目標'}
                    </span>
                    <h3 className="font-black text-base sm:text-lg text-slate-900">
                      {isJunior ? (
                        <>
                          1<Ruby base="年" reading="ねん" />で たっせい したい こと
                        </>
                      ) : (
                        '年間を通じたチーム最大目標'
                      )}
                    </h3>
                  </div>
                </div>

                {isCoachMode && (
                  <button
                    onClick={() => startEditGoal('longTerm')}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>編集</span>
                  </button>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl font-extrabold text-base sm:text-lg leading-relaxed border-l-4 ${
                  isJunior
                    ? 'bg-orange-50 text-slate-900 border-orange-600'
                    : 'bg-slate-950 text-white border-orange-500'
                }`}
              >
                {currentGoals.longTerm}
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <div
                className={`px-4 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm ${
                  isJunior ? 'bg-orange-100 text-orange-800' : 'bg-blue-950 text-sky-300'
                }`}
              >
                <span>▼</span>
                <span>
                  {isJunior
                    ? 'そのために きかんごとに がんばること！'
                    : '長期目標を達成するための期間別・中期目標'}
                </span>
                <span>▼</span>
              </div>
            </div>

            <div
              className={`bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 ${
                isJunior ? 'border-amber-300' : 'border-blue-900/25'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                      isJunior ? 'bg-amber-500' : 'bg-blue-900'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider block ${
                        isJunior ? 'text-amber-600' : 'text-blue-900'
                      }`}
                    >
                      {isJunior ? 'STEP 2 ★ シーズン（きかん）の もくひょう' : 'STEP 2 / シーズン中期目標（期間設定可）'}
                    </span>
                    <h3 className="font-black text-base sm:text-lg text-slate-900">
                      {isJunior ? 'きかんごとの 重点チャレンジ' : '対象期間別の重点テーマ'}
                    </h3>
                  </div>
                </div>

                {isCoachMode && (
                  <button
                    onClick={() => openSeasonModal(null)}
                    className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl text-white shadow-sm transition ${
                      isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isJunior ? 'あたらしい きかんを追加' : '期間・目標を追加'}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {seasonList.map((s) => {
                  const isSelected = activeSeasonObj?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() =>
                        setSelectedSeasonIdMap((prev) => ({ ...prev, [category]: s.id }))
                      }
                      className={`py-2 px-3.5 rounded-xl text-left transition-all border-2 ${
                        isSelected
                          ? isJunior
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-blue-950 text-white border-blue-950 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-black leading-tight">{s.title}</div>
                      <div
                        className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
                          isSelected ? 'text-white/90' : 'text-slate-500'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{s.period}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeSeasonObj && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isJunior
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300'
                      : 'bg-slate-50 border-blue-900/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-lg ${
                          isJunior ? 'bg-orange-600 text-white' : 'bg-blue-950 text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>対象期間：{activeSeasonObj.period}</span>
                      </span>
                      <span className="text-xs font-extrabold text-slate-600">
                        【{activeSeasonObj.title}】
                      </span>
                    </div>

                    <p className="font-extrabold text-base sm:text-lg text-slate-900 leading-relaxed pt-1">
                      {activeSeasonObj.goal}
                    </p>
                  </div>

                  {isCoachMode && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openSeasonModal(activeSeasonObj)}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>期間・目標を編集</span>
                      </button>
                      {seasonList.length > 1 && (
                        <button
                          onClick={() => deleteSeasonGoal(activeSeasonObj.id)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                          title="この期間目標を削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: 監督専用「選手一括編集」
            ========================================== */}
        {activeTab === 'bulkPlayers' && isCoachMode && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 inline-block mb-1">
                    COACH BULK EDITOR
                  </span>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <ListChecks className="w-5 h-5 text-orange-600" />
                    <span>
                      {isJunior ? '低学年 選手一括編集' : '高学年 選手一括編集'}（{bulkPlayersDraft.length}名）
                    </span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleBulkSortByNumber}
                  className="text-xs font-black px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition active:scale-95"
                >
                  番号順に整列
                </button>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                監督がここで編集・保存した内容は、すべての部員のスマホにリアルタイムで即座に反映されます！
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleBulkAddRow}
                  className="py-2.5 px-3 rounded-xl font-black text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>選手を追加する</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkSaveAll}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>一括保存して全員に同期</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {bulkPlayersDraft.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border-2 border-slate-200 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-16 shrink-0">
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                        背番号
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={item.number}
                        onChange={(e) => handleBulkFieldChange(item.id, 'number', e.target.value)}
                        className={`w-full rounded-xl border-2 px-2 py-1.5 text-center font-black text-base ${
                          isJunior
                            ? 'border-orange-300 bg-orange-50/50 text-orange-700'
                            : 'border-blue-900/30 bg-slate-50 text-blue-950'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                        選手名（#{idx + 1}）
                      </label>
                      <input
                        type="text"
                        placeholder={isJunior ? 'なまえを入力' : '選手名を入力'}
                        value={item.name}
                        onChange={(e) => handleBulkFieldChange(item.id, 'name', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-black text-slate-900"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBulkRemoveRow(item.id)}
                      className="mt-4 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                      title="この選手を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                        ポジション
                      </label>
                      <select
                        value={item.position}
                        onChange={(e) => handleBulkFieldChange(item.id, 'position', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-bold bg-white"
                      >
                        {isJunior ? (
                          <>
                            <option value="フローター">フローター</option>
                            <option value="サイド">サイド</option>
                            <option value="ポスト">ポスト</option>
                            <option value="キーパー">キーパー</option>
                            <option value="オールラウンダー">オールラウンダー</option>
                          </>
                        ) : (
                          <>
                            <option value="センター (CB)">センター (CB)</option>
                            <option value="レフトバック (LB)">レフトバック (LB)</option>
                            <option value="ライトバック (RB)">ライトバック (RB)</option>
                            <option value="レフトウイング (LW)">レフトウイング (LW)</option>
                            <option value="ライトウイング (RW)">ライトウイング (RW)</option>
                            <option value="ピボット / ポスト (PV)">ピボット / ポスト (PV)</option>
                            <option value="ゴールキーパー (GK)">ゴールキーパー (GK)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                        応援スタンプ
                      </label>
                      <select
                        value={item.stampType || 'none'}
                        onChange={(e) => handleBulkFieldChange(item.id, 'stampType', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-bold bg-white"
                      >
                        <option value="none">スタンプなし</option>
                        <option value="hanamaru">
                          {isJunior ? '💮 ハナマル！' : '🏆 目標達成クリア！'}
                        </option>
                        <option value="fight">🔥 ナイスファイト！</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                      {isJunior ? 'いまの 個人もくひょう' : '短期フォーカス目標'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        isJunior
                          ? '例: 3ぽステップで シュートを うつ！'
                          : '例: フェイントからの1対1突破'
                      }
                      value={item.goal}
                      onChange={(e) => handleBulkFieldChange(item.id, 'goal', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                        {isJunior ? '達成のめやす' : '達成基準・KPI'}
                      </label>
                      <input
                        type="text"
                        placeholder="例: シュート5本成功"
                        value={item.metric || ''}
                        onChange={(e) => handleBulkFieldChange(item.id, 'metric', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5">
                        監督コメント
                      </label>
                      <input
                        type="text"
                        placeholder="例: ステップが良くなった！"
                        value={item.coachNote || ''}
                        onChange={(e) =>
                          handleBulkFieldChange(item.id, 'coachNote', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-slate-600">
                      達成度（★1〜5）
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const active = starVal <= Number(item.progress || 0);
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => handleBulkFieldChange(item.id, 'progress', starVal)}
                            className="p-0.5 active:scale-125 transition"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                active
                                  ? isJunior
                                    ? 'fill-orange-500 text-orange-500'
                                    : 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-100 text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-20 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-lg border border-slate-200 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleBulkAddRow}
                className="py-3 px-3 rounded-xl font-black text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-orange-600" />
                <span>選手を追加</span>
              </button>

              <button
                type="button"
                onClick={handleBulkSaveAll}
                className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 ${
                  isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>一括保存して同期</span>
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: 短期的な個人目標
            ========================================== */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Target className={`w-5 h-5 ${isJunior ? 'text-orange-600' : 'text-blue-950'}`} />
                  <span>
                    {isJunior ? 'オクトパス低学年 みんなの個人もくひょう' : 'オクトパス高学年 選手別 短期目標'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  監督が更新した最新の目標と、がんばり度（★）・監督コメントがリアルタイムに反映されます！
                </p>
              </div>

              {isCoachMode && (
                <button
                  onClick={() => openPlayerModal(null)}
                  className={`flex items-center gap-1.5 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 ${
                    isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isJunior ? 'せんしゅを ついか' : '選手・目標を追加'}</span>
                </button>
              )}
            </div>

            {filteredPlayers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <p className="text-slate-500 font-bold">
                  {isJunior ? 'まだ せんしゅが とうろく されていません' : '登録されている選手がいません'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredPlayers.map((player) => {
                  const hasHanamaru = player.stampType === 'hanamaru';
                  const hasFight = player.stampType === 'fight';

                  return (
                    <div
                      key={player.id}
                      className={`relative bg-white rounded-3xl p-5 shadow-md border-2 transition-all ${
                        hasHanamaru
                          ? isJunior
                            ? 'border-orange-500 ring-2 ring-orange-200'
                            : 'border-blue-900 ring-2 ring-blue-200'
                          : 'border-slate-200'
                      }`}
                    >
                      {(hasHanamaru || hasFight) && (
                        <div
                          className={`absolute -top-3 -right-2 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 transform rotate-3 ${
                            hasHanamaru
                              ? isJunior
                                ? 'bg-gradient-to-r from-orange-600 to-amber-500'
                                : 'bg-gradient-to-r from-blue-950 to-indigo-900 border border-orange-400'
                              : 'bg-gradient-to-r from-rose-600 to-orange-500'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {hasHanamaru
                              ? isJunior
                                ? 'ハナマル！💮'
                                : '目標達成クリア！'
                              : isJunior
                              ? 'ナイスファイト！🔥'
                              : 'ナイスファイト！'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-sm ${
                              isJunior ? 'bg-orange-600' : 'bg-blue-950 border-b-2 border-orange-500'
                            }`}
                          >
                            <span className="text-[9px] leading-none opacity-80">NO.</span>
                            <span className="text-xl leading-none">{player.number}</span>
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-slate-900 leading-tight">
                              {player.name}
                            </h3>
                            <span className="inline-block text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                              {player.position}
                            </span>
                          </div>
                        </div>

                        {isCoachMode && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openPlayerModal(player)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="編集"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePlayer(player.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl mb-3 border-l-4 ${
                          isJunior
                            ? 'bg-orange-50/80 border-orange-600'
                            : 'bg-slate-50 border-blue-950'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-black block mb-1 ${
                            isJunior ? 'text-orange-700' : 'text-blue-950'
                          }`}
                        >
                          {isJunior ? '🎯 いまの もくひょう' : '🎯 短期フォーカス目標'}
                        </span>
                        <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                          {player.goal}
                        </p>

                        {player.metric && (
                          <div
                            className={`mt-2 pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-xs font-bold ${
                              isJunior ? 'text-orange-800' : 'text-slate-700'
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {isJunior ? 'めやす：' : '達成基準：'}
                              {player.metric}
                            </span>
                          </div>
                        )}
                      </div>

                      {player.coachNote && (
                        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-slate-800 font-bold flex items-start gap-2">
                          <span className="shrink-0">💬</span>
                          <span>{player.coachNote}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-600">
                            {isJunior ? 'がんばり度（たっせいど）' : '達成度評価'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starVal) => {
                              const active = starVal <= (player.progress || 0);
                              return (
                                <button
                                  key={starVal}
                                  type="button"
                                  disabled={!isCoachMode}
                                  onClick={() => updatePlayerProgress(player, starVal)}
                                  className={`p-0.5 transition-transform ${
                                    isCoachMode ? 'hover:scale-125 cursor-pointer' : 'cursor-default'
                                  }`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      active
                                        ? isJunior
                                          ? 'fill-orange-500 text-orange-500'
                                          : 'fill-amber-400 text-amber-400'
                                        : 'fill-slate-100 text-slate-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isJunior
                                ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                : 'bg-gradient-to-r from-slate-800 to-blue-950'
                            }`}
                            style={{ width: `${((player.progress || 0) / 5) * 100}%` }}
                          />
                        </div>

                        {isCoachMode && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => cyclePlayerStamp(player)}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                              <span>スタンプ切替（なし → ハナマル → ファイト）</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: チーム戦術・フォーメーション共有（作戦ボード）
            ========================================== */}
        {activeTab === 'tactics' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Compass className={`w-5 h-5 ${isJunior ? 'text-orange-600' : 'text-blue-950'}`} />
                  <span>
                    {isJunior
                      ? 'オクトパス低学年 さくせん・フォーメーション'
                      : 'オクトパス高学年 戦術・フォーメーション共有'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  監督が更新した作戦ボード（ハーフコート／オールコート）が即座に同期されます！
                </p>
              </div>

              {isCoachMode && (
                <button
                  onClick={() => openTacticModal(null)}
                  className={`flex items-center gap-1.5 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 ${
                    isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isJunior ? 'あたらしい さくせんを作成' : '戦術・フォーメーション作成'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {['ALL', 'オフェンス', 'ディフェンス', 'セットプレー', '速攻'].map((type) => {
                const active = tacticFilter === type;
                return (
                  <button
                    key={type}
                    onClick={() => setTacticFilter(type)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition border ${
                      active
                        ? isJunior
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-blue-950 text-white border-blue-950'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'ALL' ? 'すべて表示' : type}
                  </button>
                );
              })}
            </div>

            {filteredTactics.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <p className="text-slate-500 font-bold">
                  {isJunior
                    ? 'この種類の さくせんは まだ とうろく されていません'
                    : '該当する戦術・フォーメーションはまだ登録されていません'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTactics.map((tactic) => (
                  <article
                    key={tactic.id}
                    className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden"
                  >
                    <div
                      className={`p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3 border-b-4 ${
                        isJunior
                          ? 'bg-gradient-to-r from-orange-600 to-amber-500 border-slate-950'
                          : 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-orange-500'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[11px] font-black px-2.5 py-0.5 rounded-xs -skew-x-6 ${
                              tactic.tacticType === 'ディフェンス'
                                ? 'bg-sky-400 text-slate-950'
                                : tactic.tacticType === '速攻'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-orange-500 text-white'
                            }`}
                          >
                            {tactic.tacticType}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-sm bg-white/15 text-white">
                            {tactic.courtType === 'full' ? 'オールコート' : 'ハーフコート'}
                          </span>
                          {tactic.period && (
                            <span className="text-xs font-bold text-white/85 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{tactic.period}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-lg sm:text-xl leading-snug">{tactic.title}</h3>
                      </div>

                      {isCoachMode && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openTacticModal(tactic)}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>作戦ボード編集</span>
                          </button>
                          <button
                            onClick={() => deleteTactic(tactic.id)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 space-y-4">
                      <div>
                        <HandballCourtBoard
                          pieces={tactic.pieces}
                          arrows={tactic.arrows}
                          courtType={tactic.courtType || 'half'}
                          editable={false}
                        />
                      </div>

                      <div className="space-y-3">
                        <div
                          className={`p-3.5 rounded-2xl border-l-4 ${
                            isJunior
                              ? 'bg-orange-50/80 border-orange-600'
                              : 'bg-slate-50 border-blue-950'
                          }`}
                        >
                          <h4
                            className={`text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                              isJunior ? 'text-orange-700' : 'text-blue-950'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isJunior ? 'だいじな ポイント！' : '戦術の狙い・重要ポイント'}</span>
                          </h4>

                          {tactic.points && tactic.points.length > 0 ? (
                            <ul className="space-y-2">
                              {tactic.points.map((pt, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm font-bold text-slate-800 flex items-start gap-2 leading-snug"
                                >
                                  <span
                                    className={`w-5 h-5 rounded-full text-[11px] font-black text-white flex items-center justify-center shrink-0 mt-0.5 ${
                                      isJunior ? 'bg-orange-600' : 'bg-blue-950'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">ポイントは未登録です</p>
                          )}
                        </div>

                        {tactic.coachMemo && (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <span className="text-[11px] font-black text-amber-800 block mb-1">
                              {isJunior ? '📣 かんとくからの メッセージ' : '📣 監督アドバイス・注意点'}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                              {tactic.coachMemo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: 練習試合・大会フィードバック
            ========================================== */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Trophy className={`w-5 h-5 ${isJunior ? 'text-orange-600' : 'text-blue-950'}`} />
                  <span>
                    {isJunior ? 'オクトパス低学年 しあいのふりかえり' : 'オクトパス高学年 試合フィードバック'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  試合結果の投稿や、応援スタンプのタップも全員のスマホに即座に同期されます！
                </p>
              </div>

              {isCoachMode && (
                <button
                  onClick={() => setShowMatchModal(true)}
                  className={`flex items-center gap-1.5 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 ${
                    isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isJunior ? 'しあいの きろくを かく' : '試合フィードバック投稿'}</span>
                </button>
              )}
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <p className="text-slate-500 font-bold">
                  {isJunior ? 'まだ しあいの きろくが ありません' : '投稿された試合フィードバックはまだありません'}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredFeedbacks.map((fb) => {
                  const isWin = Number(fb.ourScore) > Number(fb.opponentScore);
                  const isDraw = Number(fb.ourScore) === Number(fb.opponentScore);

                  return (
                    <article
                      key={fb.id}
                      className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden"
                    >
                      <div
                        className={`p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3 border-b-4 ${
                          isJunior
                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 border-slate-950'
                            : 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-orange-500'
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold opacity-95 mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{fb.date}</span>
                            {fb.matchType && (
                              <span className="px-2 py-0.5 rounded-sm bg-white/20 text-white text-[10px] font-black">
                                {fb.matchType}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[10px] font-black tracking-wider ${
                                isWin
                                  ? 'bg-amber-400 text-slate-950'
                                  : isDraw
                                  ? 'bg-white/25 text-white'
                                  : 'bg-rose-500 text-white'
                              }`}
                            >
                              {isWin ? 'WIN!' : isDraw ? 'DRAW' : 'FIGHT!'}
                            </span>
                          </div>
                          <h3 className="font-black text-base sm:text-lg leading-snug">{fb.event}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="bg-black/35 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/15 flex items-center gap-3">
                            <div className="text-center">
                              <span className="text-[10px] block text-orange-300 font-black">
                                オクトパス
                              </span>
                              <span className="text-2xl font-black text-white">{fb.ourScore}</span>
                            </div>
                            <span className="text-lg font-bold text-white/60">-</span>
                            <div className="text-center">
                              <span className="text-[10px] block text-slate-300 font-bold">
                                OPPONENT
                              </span>
                              <span className="text-2xl font-black text-white/90">
                                {fb.opponentScore}
                              </span>
                            </div>
                          </div>

                          {isCoachMode && (
                            <button
                              onClick={() => deleteFeedback(fb.id)}
                              className="p-2 bg-white/10 hover:bg-red-500/80 rounded-xl text-white transition"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 space-y-3.5">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs sm:text-sm mb-1.5">
                              <ThumbsUp className="w-4 h-4" />
                              <span>
                                {isJunior
                                  ? '✨ よかった ところ（グッドポイント）'
                                  : 'GOOD POINTS / 良かった点'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                              {fb.goodPoints}
                            </p>
                          </div>

                          <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-3.5">
                            <div className="flex items-center gap-1.5 text-orange-700 font-black text-xs sm:text-sm mb-1.5">
                              <Shield className="w-4 h-4" />
                              <span>
                                {isJunior
                                  ? '🔥 つぎの れんしゅうの かだい'
                                  : 'NEXT STEP / 次の課題・改善点'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                              {fb.nextSteps}
                            </p>
                          </div>
                        </div>

                        {fb.mvp && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-amber-800 block">
                                {isJunior ? '👑 ナイスプレーしょう（MVP）' : 'MVP / ナイスプレー賞'}
                              </span>
                              <span className="font-black text-sm sm:text-base text-slate-900">
                                {fb.mvp}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            {isJunior
                              ? 'スタンプを おして おうえんしよう！👇'
                              : '選手・保護者リアクション：'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReaction(fb.id, 'nice')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 border border-sky-200 text-xs font-extrabold transition"
                            >
                              <span>👍</span>
                              <span>{isJunior ? 'いいね！' : 'ナイスゲーム！'}</span>
                              <span className="bg-white px-1.5 py-0.5 rounded-full text-sky-900 shadow-2xs">
                                {fb.reactions?.nice || 0}
                              </span>
                            </button>

                            <button
                              onClick={() => handleReaction(fb.id, 'fight')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 active:scale-95 text-orange-800 border border-orange-200 text-xs font-extrabold transition"
                            >
                              <span>🔥</span>
                              <span>{isJunior ? 'ファイト！' : '次もファイト！'}</span>
                              <span className="bg-white px-1.5 py-0.5 rounded-full text-orange-900 shadow-2xs">
                                {fb.reactions?.fight || 0}
                              </span>
                            </button>

                            <button
                              onClick={() => handleReaction(fb.id, 'star')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 border border-amber-200 text-xs font-extrabold transition"
                            >
                              <span>👏</span>
                              <span>{isJunior ? 'すごい！' : '拍手！'}</span>
                              <span className="bg-white px-1.5 py-0.5 rounded-full text-amber-900 shadow-2xs">
                                {fb.reactions?.star || 0}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==========================================
          ボトムナビゲーションバー（iPhone片手親指操作対応）
          ========================================== */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div
          className={`max-w-xl mx-auto grid h-16 px-1 ${
            isCoachMode ? 'grid-cols-6' : 'grid-cols-5'
          }`}
        >
          {[
            { id: 'home', icon: Home, label: 'ホーム' },
            { id: 'goals', icon: Target, label: isJunior ? 'もくひょう' : '目標' },
            { id: 'players', icon: Users, label: isJunior ? 'こじん' : '個人' },
            { id: 'tactics', icon: Compass, label: isJunior ? 'さくせん' : '戦術' },
            { id: 'matches', icon: Trophy, label: isJunior ? 'しあい' : '試合' },
            ...(isCoachMode
              ? [{ id: 'bulkPlayers', icon: ListChecks, label: '一括編集' }]
              : [])
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? isJunior
                      ? 'text-orange-600'
                      : 'text-blue-950'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition-all ${
                    isActive
                      ? isJunior
                        ? 'bg-orange-100'
                        : 'bg-blue-950/10'
                      : ''
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className="text-[10px] font-black leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==========================================
          モーダル：iPhoneホーム画面追加ガイド
          ========================================== */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-600" />
                <span>iPhoneのホーム画面に追加する方法</span>
              </h3>
              <button
                onClick={() => setShowPwaGuide(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              iPhoneの「Safari」ブラウザからホーム画面に追加しておくと、アプリのアイコンをタップするだけでいつでも最新のチーム情報にアクセスできるようになります！
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  Safariの下部（または上部）にある共有ボタン{' '}
                  <Share className="w-4 h-4 inline mx-1 text-blue-600" />{' '}
                  （四角から矢印が出ているアイコン）をタップします。
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  メニューの中からスクロールして、
                  <span className="text-orange-600 font-black">「ホーム画面に追加」</span>
                  をタップします。
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  右上の「追加」を押すと、iPhoneのホーム画面にオクトパスのアイコンが登録され、いつでも最新のデータが見られるようになります！
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowPwaGuide(false)}
                className="w-full py-3 rounded-2xl font-black text-sm bg-slate-950 text-white shadow-md active:scale-95 transition"
              >
                わかった！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          モーダル：チーム目標の編集
          ========================================== */}
      {editingGoalField && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">
                {editingGoalField === 'slogan' && 'チームスローガンの編集'}
                {editingGoalField === 'longTerm' && '1年間の長期目標の編集'}
                {editingGoalField === 'categorySubtitle' &&
                  `「${isJunior ? '低学年' : '高学年'}」タブのサブ説明編集`}
              </h3>
              <button
                onClick={() => setEditingGoalField(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <textarea
                rows={editingGoalField === 'categorySubtitle' ? 2 : 3}
                value={goalInputText}
                onChange={(e) => setGoalInputText(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none p-3.5 text-base font-bold text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingGoalField(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100"
              >
                キャンセル
              </button>
              <button
                onClick={saveGoalEdit}
                className={`px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-md ${
                  isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                }`}
              >
                保存してチーム全員に同期
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          モーダル：シーズン中期目標の編集
          ========================================== */}
      {showSeasonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={saveSeasonGoal}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">
                {editingSeasonObj ? 'シーズン中期目標・期間の編集' : '新しい期間・中期目標を追加'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSeasonModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                シーズン・フェーズ名
              </label>
              <input
                type="text"
                required
                value={seasonForm.title}
                onChange={(e) => setSeasonForm({ ...seasonForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">対象期間</label>
              <input
                type="text"
                required
                value={seasonForm.period}
                onChange={(e) => setSeasonForm({ ...seasonForm, period: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">中期目標</label>
              <textarea
                rows={3}
                required
                value={seasonForm.goal}
                onChange={(e) => setSeasonForm({ ...seasonForm, goal: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSeasonModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-md ${
                  isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                }`}
              >
                保存して同期
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          モーダル：選手個別編集
          ========================================== */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={savePlayer}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">
                {editingPlayer ? '選手の個人目標を編集' : '新しい選手と個人目標を追加'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPlayerModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">背番号</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="99"
                  value={playerForm.number}
                  onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">選手名</label>
                <input
                  type="text"
                  required
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ポジション</label>
              <select
                value={playerForm.position}
                onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold bg-white"
              >
                {isJunior ? (
                  <>
                    <option value="フローター">フローター</option>
                    <option value="サイド">サイド</option>
                    <option value="ポスト">ポスト</option>
                    <option value="キーパー">キーパー</option>
                  </>
                ) : (
                  <>
                    <option value="センター (CB)">センター (CB)</option>
                    <option value="レフトバック (LB)">レフトバック (LB)</option>
                    <option value="ライトバック (RB)">ライトバック (RB)</option>
                    <option value="レフトウイング (LW)">レフトウイング (LW)</option>
                    <option value="ライトウイング (RW)">ライトウイング (RW)</option>
                    <option value="ピボット / ポスト (PV)">ピボット / ポスト (PV)</option>
                    <option value="ゴールキーパー (GK)">ゴールキーパー (GK)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">短期的な個人目標</label>
              <textarea
                rows={2}
                required
                value={playerForm.goal}
                onChange={(e) => setPlayerForm({ ...playerForm, goal: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPlayerModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-md ${
                  isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                }`}
              >
                保存して同期
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          モーダル：戦術・作戦ボード編集
          ========================================== */}
      {showTacticModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={saveTactic}
            className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Compass className={`w-5 h-5 ${isJunior ? 'text-orange-600' : 'text-blue-950'}`} />
                <span>
                  {editingTactic
                    ? '戦術・フォーメーションを編集'
                    : '新しい戦術・フォーメーションを作成'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTacticModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">戦術カテゴリー</label>
                <select
                  value={tacticForm.tacticType}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setTacticForm((prev) => ({ ...prev, tacticType: nextType }));
                    if (nextType === '速攻' && tacticForm.courtType !== 'full') {
                      handleCourtTypeChange('full');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold bg-white"
                >
                  <option value="オフェンス">オフェンス</option>
                  <option value="ディフェンス">ディフェンス</option>
                  <option value="セットプレー">セットプレー</option>
                  <option value="速攻">速攻・リスタート</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">戦術名</label>
                <input
                  type="text"
                  required
                  value={tacticForm.title}
                  onChange={(e) => setTacticForm({ ...tacticForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700">コートサイズ（正規寸法）</label>
                <span className="text-[11px] font-bold text-slate-500">
                  {tacticForm.courtType === 'full' ? 'オールコート 20m×40m' : 'ハーフコート 20m×20m'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCourtTypeChange('half')}
                  className={`py-2 px-3 rounded-xl text-xs font-black border-2 transition ${
                    tacticForm.courtType !== 'full'
                      ? isJunior
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-blue-950 text-white border-blue-950 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ハーフコート
                </button>
                <button
                  type="button"
                  onClick={() => handleCourtTypeChange('full')}
                  className={`py-2 px-3 rounded-xl text-xs font-black border-2 transition ${
                    tacticForm.courtType === 'full'
                      ? isJunior
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-blue-950 text-white border-blue-950 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  オールコート（速攻）
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                📋 作戦ボード
              </label>
              <HandballCourtBoard
                pieces={tacticForm.pieces}
                arrows={tacticForm.arrows}
                courtType={tacticForm.courtType || 'half'}
                editable={true}
                onChange={({ pieces, arrows }) =>
                  setTacticForm((prev) => ({ ...prev, pieces, arrows }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  戦術のポイント（1行に1つ）
                </label>
                <textarea
                  rows={3}
                  value={tacticForm.pointsText}
                  onChange={(e) => setTacticForm({ ...tacticForm, pointsText: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">監督アドバイス</label>
                <textarea
                  rows={3}
                  value={tacticForm.coachMemo}
                  onChange={(e) => setTacticForm({ ...tacticForm, coachMemo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTacticModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-md ${
                  isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                }`}
              >
                保存して同期
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          モーダル：試合フィードバック投稿
          ========================================== */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={saveMatchFeedback}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">試合フィードバックを投稿</h3>
              <button
                type="button"
                onClick={() => setShowMatchModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">試合日</label>
                <input
                  type="date"
                  required
                  value={matchForm.date}
                  onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">種別</label>
                <select
                  value={matchForm.matchType}
                  onChange={(e) => setMatchForm({ ...matchForm, matchType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold bg-white"
                >
                  <option value="練習試合">練習試合</option>
                  <option value="大会">大会・公式戦</option>
                  <option value="紅白戦">紅白戦</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">スコア</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="自"
                    value={matchForm.ourScore}
                    onChange={(e) => setMatchForm({ ...matchForm, ourScore: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-2 py-2 text-sm font-bold text-center"
                  />
                  <span className="font-black text-slate-400">-</span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="相手"
                    value={matchForm.opponentScore}
                    onChange={(e) =>
                      setMatchForm({ ...matchForm, opponentScore: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-2 py-2 text-sm font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">大会名・対戦相手</label>
              <input
                type="text"
                required
                value={matchForm.event}
                onChange={(e) => setMatchForm({ ...matchForm, event: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">良かった点</label>
              <textarea
                rows={3}
                required
                value={matchForm.goodPoints}
                onChange={(e) => setMatchForm({ ...matchForm, goodPoints: e.target.value })}
                className="w-full rounded-xl border border-emerald-300 bg-emerald-50/30 p-3 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-orange-700 mb-1">次の課題</label>
              <textarea
                rows={2}
                required
                value={matchForm.nextSteps}
                onChange={(e) => setMatchForm({ ...matchForm, nextSteps: e.target.value })}
                className="w-full rounded-xl border border-orange-300 bg-orange-50/30 p-3 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-700 mb-1">MVP</label>
              <input
                type="text"
                value={matchForm.mvp}
                onChange={(e) => setMatchForm({ ...matchForm, mvp: e.target.value })}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/30 px-3 py-2 text-sm font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMatchModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-md ${
                  isJunior ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-950 hover:bg-blue-900'
                }`}
              >
                チームに同期して投稿
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 画面への描画（index.html の #root に表示）
// ==========================================
ReactDOM.createRoot(document.getElementById('root')).render(<App />);


                                                          
