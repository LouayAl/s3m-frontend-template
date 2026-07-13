import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, MenuItem,
  Select, FormControl, InputLabel, Button,
  Alert, CircularProgress, Divider, LinearProgress,
  useMediaQuery, useTheme, Avatar,
} from '@mui/material';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;
const ACCENT   = '#e65100';

const QUESTIONS = [
  { id: 1,  type: 'VRAI_FAUX', text: "La sécurité au travail est uniquement la responsabilité de la direction.", imageUrl: null },
  { id: 2,  type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-2.png',
    choices: [{ key: 'a', label: "Casque de sécurité peut être porté" }, { key: 'b', label: "Le casque de sécurité doit être porté" }, { key: 'c', label: "Ceci est une zone à risque" }] },
  { id: 3,  type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-3.png',
    choices: [{ key: 'a', label: "Attention, charge suspendue" }, { key: 'b', label: "Danger de mort" }, { key: 'c', label: "Risque de collision" }] },
  { id: 4,  type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-4.png',
    choices: [{ key: 'a', label: "Le gilet haute visibilité est obligatoire" }, { key: 'b', label: "Le gilet de sauvetage est obligatoire" }, { key: 'c', label: "Un gilet de haute visibilité peut être porté" }] },
  { id: 5,  type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-5.png',
    choices: [{ key: 'a', label: "Danger eau profonde" }, { key: 'b', label: "Chute de hauteur" }, { key: 'c', label: "Risque de trébuchement et de glissade" }] },
  { id: 6,  type: 'VRAI_FAUX', text: "En cas d'urgence, n'utilisez jamais l'ascenseur pour sortir du bâtiment.", imageUrl: null },
  { id: 7,  type: 'VRAI_FAUX', text: "N'importe qui peut saisir en toute sécurité un extincteur pour éteindre un feu.", imageUrl: null },
  { id: 8,  type: 'MCQ', text: "La manière correcte d'entretenir un extincteur sur le lieu de travail est :", imageUrl: null,
    choices: [{ key: 'a', label: "Retirez la goupille et gardez-la prête à l'emploi" }, { key: 'b', label: "Retirez la goupille, appuyez sur la détente et gardez-le prêt à l'emploi" }, { key: 'c', label: "Conservez-le dans son état d'origine : équipé d'une broche et d'un sceau" }] },
  { id: 9,  type: 'MCQ', text: "Pour sauver un homme tombé à la mer, la première étape est :", imageUrl: null,
    choices: [{ key: 'a', label: "Gardez un contact visuel avec la victime, lancez l'anneau de sauvetage le plus proche" }, { key: 'b', label: "Plongez dans l'eau pour sauver la victime" }, { key: 'c', label: "Appelez l'autorité portuaire" }] },
  { id: 10, type: 'VRAI_FAUX', text: "L'entretien des « Équipements de Protection Individuelle » est de la responsabilité des opérateurs.", imageUrl: null },
  { id: 11, type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-11.png',
    choices: [{ key: 'a', label: "Véhicule autorisé seulement" }, { key: 'b', label: "Accès interdit aux piétons" }, { key: 'c', label: "Zone dangereuse" }] },
  { id: 12, type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-12.png',
    choices: [{ key: 'a', label: "Trousse de premiers soins" }, { key: 'b', label: "Safe Route to Fire Exit" }, { key: 'c', label: "Master point (point de rassemblement)" }] },
  { id: 13, type: 'MCQ', text: "Quelle est la signification de ce panneau ?", imageUrl: '/quiz/question-13.png',
    choices: [{ key: 'a', label: "Dangereux pour l'environnement" }, { key: 'b', label: "Dangereux pour l'homme" }, { key: 'c', label: "Poison" }] },
  { id: 14, type: 'MCQ', text: "Lequel des panneaux suivants signifie « Danger, Électricité » ?", imageUrl: null,
    choices: [{ key: 'a', label: "Panneau A" }, { key: 'b', label: "Panneau B" }, { key: 'c', label: "Panneau C" }, { key: 'd', label: "Panneau D" }],
    multiImage: ['/quiz/question-14-a.png', '/quiz/question-14-b.png', '/quiz/question-14-c.png', '/quiz/question-14-d.png'] },
  { id: 15, type: 'MCQ', text: "Qu'est-ce que la maladie professionnelle ?", imageUrl: null,
    choices: [{ key: 'a', label: "Maladie transmise par un collègue" }, { key: 'b', label: "Maladie causée par les conditions de travail" }, { key: 'c', label: "Maladie liée à l'ancienneté au travail" }] },
  { id: 16, type: 'MCQ', text: "Quelle image a la forme et la couleur correctes pour un panneau « Interdiction » ou « Ne pas » ?", imageUrl: null,
    choices: [{ key: 'a', label: "Panneau A" }, { key: 'b', label: "Panneau B" }, { key: 'c', label: "Panneau C" }, { key: 'd', label: "Panneau D" }],
    multiImage: ['/quiz/question-16-a.png', '/quiz/question-16-b.png', '/quiz/question-16-c.png', '/quiz/question-16-d.png'] },
  { id: 17, type: 'VRAI_FAUX', text: "La sécurité n'est qu'une question de bon sens. L'entité n'a pas besoin de perdre du temps à former les gens.", imageUrl: null },
  { id: 18, type: 'VRAI_FAUX', text: "Vous n'avez pas besoin de demander la permission de la victime pour prodiguer les premiers soins.", imageUrl: null },
  { id: 19, type: 'VRAI_FAUX', text: "Si la scène n'est pas sûre, il est acceptable de déplacer la victime avant de pratiquer les premiers secours.", imageUrl: null },
  { id: 20, type: 'VRAI_FAUX', text: "Housekeeping (L'entretien ménager) joue un rôle important dans la prévention des glissades, trébuchements et chutes.", imageUrl: null },
  { id: 21, type: 'MCQ', text: "Lorsqu'on monte à une échelle :", imageUrl: null,
    choices: [{ key: 'a', label: "Suivez la règle des 3 points de contact" }, { key: 'b', label: "Tourne-toi dos à l'échelle pour pouvoir sauter au cas où tu glisses" }] },
  { id: 22, type: 'MCQ', text: "Les types de glissades et de chutes les plus courants dans l'exploitation minière sont :", imageUrl: null,
    choices: [{ key: 'a', label: "Marcher sur les Catwalks (passerelles)" }, { key: 'b', label: "Courir sur des surfaces planes" }, { key: 'c', label: "Montage et démontage d'équipement" }] },
  { id: 23, type: 'MCQ', text: "La première étape en cas d'urgence est :", imageUrl: null,
    choices: [{ key: 'a', label: "Vérification du battement de cœur de la victime" }, { key: 'b', label: "Vérification de la scène pour la sécurité" }, { key: 'c', label: "Vérifier si la victime est consciente" }] },
];

const NO_SELECT_STYLE = {
  userSelect: 'none', WebkitUserSelect: 'none',
  MozUserSelect: 'none', msUserSelect: 'none',
};

// ── Multi-image grid for Q14 and Q16 ─────────────────────────────────────────

function MultiImageGrid({ images, choices, answer, onAnswer, questionId, isMobile }) {
  return (
    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5} mt={1}>
      {images.map((src, idx) => {
        const key = choices[idx].key;
        const selected = answer === key;
        return (
          <Box
            key={key}
            onClick={() => onAnswer(String(questionId), key)}
            sx={{
              border: selected ? `2px solid ${ACCENT}` : '2px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              bgcolor: selected ? `${ACCENT}10` : 'transparent',
              transition: 'all 0.15s ease',
              '&:active': { transform: 'scale(0.97)' },
            }}
          >
            <img
              src={src}
              alt={`Panneau ${key.toUpperCase()}`}
              style={{ width: '100%', height: isMobile ? 100 : 120, objectFit: 'contain', display: 'block', padding: 8 }}
              onContextMenu={e => e.preventDefault()}
              draggable={false}
            />
            <Box sx={{
              textAlign: 'center', py: 0.75,
              bgcolor: selected ? ACCENT : '#f5f5f5',
              transition: 'background-color 0.15s',
            }}>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: selected ? 'white' : 'text.secondary', ...NO_SELECT_STYLE }}>
                Panneau {key.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ── AnswerButton ──────────────────────────────────────────────────────────────

function AnswerButton({ label, selected, onClick, isMobile }) {
  return (
    <Box onClick={onClick} sx={{
      ...NO_SELECT_STYLE,
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: isMobile ? 1.5 : 1.25, borderRadius: 2,
      border: selected ? `2px solid ${ACCENT}` : '2px solid #e0e0e0',
      bgcolor: selected ? `${ACCENT}12` : 'transparent',
      cursor: 'pointer', transition: 'all 0.15s ease',
      WebkitTapHighlightColor: 'transparent',
      '&:active': { transform: 'scale(0.98)' },
    }}>
      <Box sx={{
        width: isMobile ? 22 : 18, height: isMobile ? 22 : 18,
        borderRadius: '50%', flexShrink: 0,
        border: selected ? `2px solid ${ACCENT}` : '2px solid #bdbdbd',
        bgcolor: selected ? ACCENT : 'transparent',
        transition: 'all 0.15s ease',
      }} />
      <Typography variant="body2" sx={{
        color: selected ? ACCENT : 'text.primary',
        fontWeight: selected ? 600 : 400, lineHeight: 1.5, ...NO_SELECT_STYLE,
      }}>
        {label}
      </Typography>
    </Box>
  );
}

// ── QuestionCard ──────────────────────────────────────────────────────────────

function QuestionCard({ question, answer, onAnswer, isMobile, index }) {
  const choices = question.type === 'VRAI_FAUX'
    ? [{ key: 'VRAI', label: '✓  VRAI' }, { key: 'FAUX', label: '✗  FAUX' }]
    : question.choices;

  return (
    <Card sx={{
      mb: 2,
      border: answer ? `1px solid ${ACCENT}33` : '1px solid #e0e0e0',
      transition: 'border-color 0.2s',
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box display="flex" gap={1.5} mb={1.5} alignItems="flex-start">
          <Box sx={{
            minWidth: 30, height: 30, borderRadius: '50%',
            bgcolor: answer ? ACCENT : '#eeeeee',
            color: answer ? 'white' : '#9e9e9e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
            transition: 'background-color 0.2s',
          }}>
            {index + 1}
          </Box>
          <Typography variant="body1" fontWeight={500}
            sx={{ lineHeight: 1.55, ...NO_SELECT_STYLE }}>
            {question.text}
          </Typography>
        </Box>

        {/* Single image (Q2–Q5, Q11–Q13) */}
        {question.imageUrl && (
          <Box mb={1.5} textAlign="center"
            sx={{ bgcolor: '#f9f9f9', borderRadius: 2, p: 1.5 }}>
            <img
              src={question.imageUrl}
              alt={`Panneau Q${question.id}`}
              style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
              onContextMenu={e => e.preventDefault()}
              draggable={false}
            />
          </Box>
        )}

        {/* Multi-image grid (Q14, Q16) */}
        {question.multiImage ? (
          <MultiImageGrid
            images={question.multiImage}
            choices={choices}
            answer={answer}
            onAnswer={onAnswer}
            questionId={question.id}
            isMobile={isMobile}
          />
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {choices.map(c => (
              <AnswerButton
                key={c.key}
                label={question.type === 'VRAI_FAUX' ? c.label : `${c.key.toUpperCase()}.  ${c.label}`}
                selected={answer === c.key}
                onClick={() => onAnswer(String(question.id), c.key)}
                isMobile={isMobile}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ── Name selection screen ─────────────────────────────────────────────────────

function NameSelectionScreen({ participants, onStart, isMobile }) {
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!selectedEmploye) { setError('Veuillez sélectionner votre nom avant de continuer.'); return; }
    onStart(selectedEmploye);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center"
      minHeight="100vh" p={{ xs: 2, sm: 3 }} sx={{ bgcolor: '#fafafa' }}>
      <Box sx={{ maxWidth: 480, width: '100%' }}>

        {/* S3M Logo */}
        <Box textAlign="center" mb={3}>
          <img
            src="/s3m-logo.png"
            alt="S3M"
            style={{ height: 100, objectFit: 'contain', marginBottom: 12 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Quiz Sécurité & Culture de Sécurité
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez votre nom pour commencer le quiz ({QUESTIONS.length} questions)
          </Typography>
        </Box>

        <Card sx={{ borderTop: `4px solid ${ACCENT}` }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'} sx={{ mb: 2 }}>
              <InputLabel>Votre nom</InputLabel>
              <Select
                value={selectedEmploye}
                label="Votre nom"
                onChange={e => { setSelectedEmploye(e.target.value); setError(''); }}
              >
                {participants.map(p => (
                  <MenuItem key={p.idEmploye} value={p.idEmploye}>
                    {p.nomComplet}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button fullWidth variant="contained" size="large" onClick={handleStart}
              sx={{ py: 1.5, bgcolor: ACCENT, '&:hover': { bgcolor: '#bf360c' },
                fontSize: '1rem', fontWeight: 700 }}>
              Commencer le Quiz →
            </Button>

            <Typography variant="caption" color="text.secondary"
              display="block" textAlign="center" mt={2}>
              Répondez individuellement et honnêtement à chaque question.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PublicQuizForm() {
  const { sessionId } = useParams();
  const theme         = useTheme();
  const isMobile      = useMediaQuery(theme.breakpoints.down('sm'));

  const [step,            setStep]            = useState('loading');
  const [participants,    setParticipants]    = useState([]);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [answers,         setAnswers]         = useState({});
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState('');
  const [startedAt,       setStartedAt]       = useState(null); // ← timing

  useEffect(() => {
    if (step !== 'quiz') return;
    const block = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (e.ctrlKey && ['a','c','x','u'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [step]);

  useEffect(() => {
    axios.get(`${BASE_URL}/public/sessions/${sessionId}/participants`)
      .then(r => { setParticipants(r.data); setStep('name'); })
      .catch(() => setStep('error'));
  }, [sessionId]);

  const handleStart = (employeId) => {
    setSelectedEmploye(employeId);
    setStartedAt(new Date().toISOString()); // ← record start time
    setStep('quiz');
  };

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      setError('Veuillez répondre à toutes les questions avant de soumettre.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await axios.post(`${BASE_URL}/public/quiz/submit`, {
        idSession: parseInt(sessionId),
        idEmploye: selectedEmploye,
        reponses:  answers,
        debutLe:   startedAt,          // ← send start time
      });
      setStep('done');
    } catch (err) {
      setError(err.response?.status === 409
        ? 'Vous avez déjà soumis ce quiz pour cette session.'
        : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'loading') return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress sx={{ color: ACCENT }} />
    </Box>
  );

  if (step === 'error') return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Alert severity="error">Impossible de charger le quiz. Vérifiez le lien QR.</Alert>
    </Box>
  );

  if (step === 'name') return (
    <NameSelectionScreen participants={participants} onStart={handleStart} isMobile={isMobile} />
  );

  if (step === 'done') return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Card sx={{ maxWidth: 480, width: '100%', textAlign: 'center', p: { xs: 3, sm: 4 } }}>
        <Typography variant="h2" mb={2}>✅</Typography>
        <Typography variant="h5" fontWeight={700} mb={1}>Quiz soumis !</Typography>
        <Typography color="text.secondary">
          Vos réponses ont été enregistrées avec succès. Merci pour votre participation.
        </Typography>
      </Card>
    </Box>
  );

  const answeredCount = Object.keys(answers).length;
  const progressPct   = Math.round((answeredCount / QUESTIONS.length) * 100);

  return (
    <Box display="flex" justifyContent="center" minHeight="100vh"
      p={{ xs: 1, sm: 2 }} sx={{ bgcolor: '#fafafa', ...NO_SELECT_STYLE }}
      onContextMenu={e => e.preventDefault()}>
      <Box sx={{ maxWidth: 680, width: '100%', mt: { xs: 1, sm: 3 }, mb: 4 }}>

        <Card sx={{ mb: 2, position: 'sticky', top: 8, zIndex: 10, borderTop: `4px solid ${ACCENT}` }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pb: '12px !important' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700}>🦺 Quiz Sécurité</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {answeredCount}/{QUESTIONS.length} répondues
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progressPct} sx={{
              height: 6, borderRadius: 4, bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: progressPct === 100 ? '#66bb6a' : ACCENT,
                transition: 'transform 0.3s ease',
              },
            }} />
          </CardContent>
        </Card>

        {QUESTIONS.map((q, idx) => (
          <QuestionCard key={q.id} question={q} answer={answers[String(q.id)] ?? null}
            onAnswer={handleAnswer} isMobile={isMobile} index={idx} />
        ))}

        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {answeredCount < QUESTIONS.length && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {QUESTIONS.length - answeredCount} question{QUESTIONS.length - answeredCount > 1 ? 's' : ''} sans réponse
              </Alert>
            )}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button fullWidth variant="contained" size="large" onClick={handleSubmit}
              disabled={submitting || answeredCount < QUESTIONS.length}
              sx={{
                py: { xs: 1.5, sm: 1.25 }, bgcolor: ACCENT,
                '&:hover': { bgcolor: '#bf360c' },
                '&.Mui-disabled': { bgcolor: '#ccc' },
                fontSize: { xs: '1rem', sm: '0.9375rem' }, fontWeight: 700,
              }}>
              {submitting
                ? <CircularProgress size={24} color="inherit" />
                : `Soumettre mes réponses (${answeredCount}/${QUESTIONS.length})`}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}