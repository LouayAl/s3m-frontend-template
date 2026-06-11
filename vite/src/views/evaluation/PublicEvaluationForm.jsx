// frontend-template/vite/src/views/evaluation/PublicEvaluationForm.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, MenuItem,
  Select, FormControl, InputLabel, Button,
  TextField, Alert, CircularProgress, Divider,
  Chip, ToggleButtonGroup, ToggleButton, Radio,
  RadioGroup, FormControlLabel, Stack,
} from '@mui/material';
import { getPublicParticipants, submitEvaluationAChaud } from '../../api/evaluationApi';

// ── Hardcoded formulaire ───────────────────────────────────────────────────────

const SECTIONS = {
  fr: [
    { id: 1, label: 'Conditions de réalisation' },
    { id: 2, label: 'Compétences techniques et pédagogiques' },
    { id: 3, label: 'Atteinte des objectifs' },
  ],
  en: [
    { id: 1, label: 'Implementation Conditions' },
    { id: 2, label: 'Technical and Pedagogical Skills' },
    { id: 3, label: 'Achievement of Objectives' },
  ],
  ar: [
    { id: 1, label: 'ظروف التنفيذ' },
    { id: 2, label: 'الكفاءات التقنية والبيداغوجية' },
    { id: 3, label: 'تحقيق الأهداف' },
  ],
};

const QUESTIONS = {
  fr: [
    { id: 1,  sectionId: 1, label: "L'information concernant la formation a été complète" },
    { id: 2,  sectionId: 1, label: "La durée et le rythme de la formation étaient conformes à ce qui a été annoncé" },
    { id: 3,  sectionId: 1, label: "Les documents annoncés ont été remis aux participants." },
    { id: 4,  sectionId: 1, label: "Les documents remis constituent une aide à l'assimilation des contenus" },
    { id: 5,  sectionId: 1, label: "Les contenus de la formation étaient adaptés à mon niveau initial" },
    { id: 6,  sectionId: 1, label: "Les conditions matérielles (locaux, restauration, facilité d'accès, etc.) étaient satisfaisantes." },
    { id: 7,  sectionId: 2, label: "Le formateur dispose des compétences techniques nécessaires" },
    { id: 8,  sectionId: 2, label: "Le formateur dispose des compétences pédagogiques" },
    { id: 9,  sectionId: 2, label: "Le formateur a su créer ou entretenir une ambiance agréable dans le groupe en formation" },
    { id: 10, sectionId: 2, label: "Les moyens pédagogiques étaient adaptés au contenu de la formation" },
    { id: 11, sectionId: 3, label: "Les objectifs de la formation correspondent à mes besoins professionnels" },
    { id: 12, sectionId: 3, label: "Les objectifs recherchés à travers cette formation ont été atteint" },
    { id: 13, sectionId: 3, label: "D'une manière générale, cette formation me permettra d'améliorer mes compétences professionnelles" },
  ],
  en: [
    { id: 1,  sectionId: 1, label: "The information about the training was complete" },
    { id: 2,  sectionId: 1, label: "The duration and pace of the training matched what was announced" },
    { id: 3,  sectionId: 1, label: "The announced documents were provided to participants." },
    { id: 4,  sectionId: 1, label: "The provided documents help in assimilating the content" },
    { id: 5,  sectionId: 1, label: "The training content was adapted to my initial level" },
    { id: 6,  sectionId: 1, label: "The material conditions (premises, catering, accessibility, etc.) were satisfactory." },
    { id: 7,  sectionId: 2, label: "The trainer has the necessary technical skills" },
    { id: 8,  sectionId: 2, label: "The trainer has the necessary pedagogical skills" },
    { id: 9,  sectionId: 2, label: "The trainer was able to create or maintain a pleasant atmosphere in the training group" },
    { id: 10, sectionId: 2, label: "The pedagogical resources were suited to the training content" },
    { id: 11, sectionId: 3, label: "The training objectives match my professional needs" },
    { id: 12, sectionId: 3, label: "The objectives sought through this training have been achieved" },
    { id: 13, sectionId: 3, label: "In general, this training will allow me to improve my professional skills" },
  ],
  ar: [
    { id: 1,  sectionId: 1, label: "كانت المعلومات المتعلقة بالتكوين كاملة" },
    { id: 2,  sectionId: 1, label: "كانت مدة التكوين وإيقاعه متوافقين مع ما تم الإعلان عنه" },
    { id: 3,  sectionId: 1, label: "تم تسليم الوثائق المُعلنة للمشاركين" },
    { id: 4,  sectionId: 1, label: "الوثائق المُسلَّمة تُساعد على استيعاب المحتوى" },
    { id: 5,  sectionId: 1, label: "كانت محتويات التكوين ملائمة لمستواي الأولي" },
    { id: 6,  sectionId: 1, label: "كانت الظروف المادية (المباني، التغذية، سهولة الوصول...) مُرضية" },
    { id: 7,  sectionId: 2, label: "يمتلك المكوِّن الكفاءات التقنية اللازمة" },
    { id: 8,  sectionId: 2, label: "يمتلك المكوِّن الكفاءات البيداغوجية اللازمة" },
    { id: 9,  sectionId: 2, label: "استطاع المكوِّن خلق أو الحفاظ على جو ملائم داخل مجموعة التكوين" },
    { id: 10, sectionId: 2, label: "كانت الوسائل البيداغوجية ملائمة لمحتوى التكوين" },
    { id: 11, sectionId: 3, label: "تتوافق أهداف التكوين مع احتياجاتي المهنية" },
    { id: 12, sectionId: 3, label: "تم تحقيق الأهداف المنشودة من خلال هذا التكوين" },
    { id: 13, sectionId: 3, label: "بشكل عام، سيُمكّنني هذا التكوين من تحسين كفاءاتي المهنية" },
  ],
};

const SCALE = {
  fr: ['Pas du tout', 'Peu', 'Moyen', 'Tout à fait'],
  en: ['Not at all', 'A little', 'Average', 'Completely'],
  ar: ['أبدًا', 'قليلاً', 'متوسط', 'تمامًا'],
};

const UI = {
  fr: {
    title: 'Évaluation à chaud',
    yourName: 'Votre nom',
    comment: 'Commentaire libre (optionnel)',
    submit: 'Soumettre mon évaluation',
    successTitle: 'Merci pour votre évaluation !',
    successBody: 'Vos réponses ont été enregistrées avec succès.',
    errorName: 'Veuillez sélectionner votre nom.',
    errorAll: 'Veuillez répondre à toutes les questions.',
    errorConflict: 'Vous avez déjà soumis une évaluation pour ce jour.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    errorLoad: 'Impossible de charger les participants. Vérifiez le lien.',
  },
  en: {
    title: 'Training Evaluation',
    yourName: 'Your name',
    comment: 'Free comment (optional)',
    submit: 'Submit my evaluation',
    successTitle: 'Thank you for your evaluation!',
    successBody: 'Your answers have been successfully recorded.',
    errorName: 'Please select your name.',
    errorAll: 'Please answer all questions.',
    errorConflict: 'You have already submitted an evaluation for this day.',
    errorGeneric: 'An error occurred. Please try again.',
    errorLoad: 'Unable to load participants. Check the link.',
  },
  ar: {
    title: 'تقييم التكوين',
    yourName: 'اسمك',
    comment: 'تعليق حر (اختياري)',
    submit: 'إرسال تقييمي',
    successTitle: 'شكراً على تقييمك!',
    successBody: 'تم تسجيل إجاباتك بنجاح.',
    errorName: 'يرجى اختيار اسمك.',
    errorAll: 'يرجى الإجابة على جميع الأسئلة.',
    errorConflict: 'لقد قدمت تقييماً لهذا اليوم من قبل.',
    errorGeneric: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    errorLoad: 'تعذّر تحميل المشاركين. تحقق من الرابط.',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PublicEvaluationForm() {
  const { sessionId, jour } = useParams();

  const [lang,            setLang]            = useState('fr');
  const [participants,    setParticipants]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [error,           setError]           = useState('');
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [answers,         setAnswers]         = useState({}); // { questionId: score 1-4 }
  const [commentaire,     setCommentaire]     = useState('');

  const t  = UI[lang];
  const isRtl = lang === 'ar';

  const formattedJour = jour
    ? new Date(...jour.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)))
        .toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-GB' : 'fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
    : '';

  useEffect(() => {
    getPublicParticipants(sessionId)
      .then(setParticipants)
      .catch(() => setError(UI[lang].errorLoad))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleAnswer = (questionId, score) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async () => {
    if (!selectedEmploye) { setError(t.errorName); return; }
    const allAnswered = QUESTIONS[lang].every(q => answers[q.id] > 0);
    if (!allAnswered) { setError(t.errorAll); return; }

    setError('');
    setSubmitting(true);
    try {
      await submitEvaluationAChaud({
        idSession:      parseInt(sessionId),
        idEmploye:      selectedEmploye,
        jourEvaluation: jour,
        reponses:       answers,
        commentaire,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.status === 409 ? t.errorConflict : t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  if (submitted) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Card sx={{ maxWidth: 480, width: '100%', textAlign: 'center', p: 4 }}>
        <Typography variant="h3" mb={2}>✅</Typography>
        <Typography variant="h5" fontWeight={700} mb={1}>{t.successTitle}</Typography>
        <Typography color="text.secondary">{t.successBody}</Typography>
      </Card>
    </Box>
  );

  const questions  = QUESTIONS[lang];
  const sections   = SECTIONS[lang];
  const scaleLabels = SCALE[lang];

  return (
    <Box
      display="flex" justifyContent="center"
      minHeight="100vh" p={2}
      sx={{ bgcolor: '#f5f5f5' }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Box sx={{ maxWidth: 720, width: '100%', mt: 3, mb: 4 }}>

        {/* Header card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start"
              flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>{t.title}</Typography>
                <Chip label={formattedJour} color="primary" size="small" sx={{ mt: 1 }} />
              </Box>

              {/* Language switcher */}
              <ToggleButtonGroup
                value={lang}
                exclusive
                onChange={(_, v) => v && setLang(v)}
                size="small"
              >
                <ToggleButton value="fr">FR</ToggleButton>
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ar">AR</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Participant selector */}
            <FormControl fullWidth>
              <InputLabel>{t.yourName}</InputLabel>
              <Select
                value={selectedEmploye}
                label={t.yourName}
                onChange={e => setSelectedEmploye(e.target.value)}
              >
                {participants.map(p => (
                  <MenuItem key={p.idEmploye} value={p.idEmploye}>
                    {p.nomComplet}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Sections and questions */}
        {sections.map(section => {
          const sectionQuestions = questions.filter(q => q.sectionId === section.id);
          return (
            <Card key={section.id} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Section header — matches the original table style */}
                <Box
                  sx={{
                    bgcolor: '#1a1a2e',
                    color: 'white',
                    px: 2, py: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography fontWeight={700}>{section.label}</Typography>
                  <Box display="flex" gap={1}>
                    {scaleLabels.map((label, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        sx={{
                          width: 64,
                          textAlign: 'center',
                          color: 'rgba(255,255,255,0.85)',
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Questions */}
                {sectionQuestions.map((q, idx) => (
                  <Box key={q.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2, py: 1.5,
                        bgcolor: idx % 2 === 0 ? 'transparent' : 'action.hover',
                        gap: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {q.label}
                      </Typography>

                      <RadioGroup
                        row
                        value={answers[q.id] ?? ''}
                        onChange={e => handleAnswer(q.id, parseInt(e.target.value))}
                        sx={{ flexShrink: 0 }}
                      >
                        {[1, 2, 3, 4].map(score => (
                          <FormControlLabel
                            key={score}
                            value={score}
                            control={<Radio size="small" />}
                            label=""
                            sx={{ mx: 0, width: 64, justifyContent: 'center' }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                    {idx < sectionQuestions.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Comment + submit */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <TextField
              fullWidth multiline rows={3}
              label={t.comment}
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              sx={{ mb: 2 }}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              fullWidth variant="contained" size="large"
              onClick={handleSubmit} disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : t.submit}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}