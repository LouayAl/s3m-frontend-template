// frontend-template/vite/src/views/evaluation/PublicEvaluationForm.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, MenuItem,
  Select, FormControl, InputLabel, Button,
  TextField, Alert, CircularProgress, Divider,
  ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme,
} from '@mui/material';
import { getPublicParticipants, submitEvaluationAChaud } from '../../api/evaluationApi';

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

const SCALE_COLORS = ['#ef5350', '#ff9800', '#42a5f5', '#66bb6a'];

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
    errorConflict: 'Vous avez déjà soumis une évaluation pour cette session.',
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
    errorConflict: 'You have already submitted an evaluation for this session.',
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
    errorConflict: 'لقد قدمت تقييماً لهذه الدورة من قبل.',
    errorGeneric: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    errorLoad: 'تعذّر تحميل المشاركين. تحقق من الرابط.',
  },
};

function ScoreToggle({ questionId, value, onChange, scaleLabels, isMobile }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75, width: '100%' }}>
      {[1, 2, 3, 4].map((score, i) => {
        const selected = value === score;
        const color    = SCALE_COLORS[i];
        return (
          <Box
            key={score}
            onClick={() => onChange(questionId, score)}
            sx={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 0.5,
              py: isMobile ? 1.25 : 0.75, px: 0.5,
              borderRadius: 2,
              border:  selected ? `2px solid ${color}` : '2px solid #e0e0e0',
              bgcolor: selected ? `${color}18` : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s ease',
              userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <Box sx={{
              width: isMobile ? 28 : 22, height: isMobile ? 28 : 22,
              borderRadius: '50%',
              bgcolor: selected ? color : '#e0e0e0',
              transition: 'background-color 0.15s ease', flexShrink: 0,
            }} />
            <Typography variant="caption" sx={{
              fontSize: isMobile ? '0.65rem' : '0.6rem',
              lineHeight: 1.2, textAlign: 'center',
              color: selected ? color : 'text.secondary',
              fontWeight: selected ? 700 : 400,
            }}>
              {scaleLabels[i]}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default function PublicEvaluationForm() {
  const { sessionId } = useParams();
  const theme         = useTheme();
  const isMobile      = useMediaQuery(theme.breakpoints.down('sm'));

  const [lang,            setLang]            = useState('fr');
  const [participants,    setParticipants]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [error,           setError]           = useState('');
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [answers,         setAnswers]         = useState({});
  const [commentaire,     setCommentaire]     = useState('');

  const t     = UI[lang];
  const isRtl = lang === 'ar';

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
    if (!selectedEmploye)                                { setError(t.errorName); return; }
    if (!QUESTIONS[lang].every(q => answers[q.id] > 0)) { setError(t.errorAll);  return; }

    setError('');
    setSubmitting(true);
    try {
      await submitEvaluationAChaud({
        idSession:  parseInt(sessionId),
        idEmploye:  selectedEmploye,
        reponses:   answers,
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
      <Card sx={{ maxWidth: 480, width: '100%', textAlign: 'center', p: { xs: 3, sm: 4 } }}>
        <Typography variant="h3" mb={2}>✅</Typography>
        <Typography variant="h5" fontWeight={700} mb={1}>{t.successTitle}</Typography>
        <Typography color="text.secondary">{t.successBody}</Typography>
      </Card>
    </Box>
  );

  const questions     = QUESTIONS[lang];
  const sections      = SECTIONS[lang];
  const scaleLabels   = SCALE[lang];
  const answeredCount = Object.keys(answers).length;
  const progressPct   = Math.round((answeredCount / 13) * 100);

  return (
    <Box
      display="flex" justifyContent="center"
      minHeight="100vh" p={{ xs: 1, sm: 2 }}
      sx={{ bgcolor: '#f5f5f5' }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Box sx={{ maxWidth: 720, width: '100%', mt: { xs: 1, sm: 3 }, mb: 4 }}>

        {/* Header */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start"
              flexWrap="wrap" gap={1.5} mb={1.5}>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} flex={1}>
                {t.title}
              </Typography>
              <ToggleButtonGroup
                value={lang} exclusive
                onChange={(_, v) => v && setLang(v)}
                size="small" sx={{ flexShrink: 0 }}
              >
                <ToggleButton value="fr" sx={{ px: { xs: 1.25, sm: 2 } }}>FR</ToggleButton>
                <ToggleButton value="en" sx={{ px: { xs: 1.25, sm: 2 } }}>EN</ToggleButton>
                <ToggleButton value="ar" sx={{ px: { xs: 1.25, sm: 2 } }}>AR</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {answeredCount > 0 && (
              <Box mb={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">{answeredCount}/13</Typography>
                  <Typography variant="caption" color="text.secondary">{progressPct}%</Typography>
                </Box>
                <Box sx={{ bgcolor: '#e0e0e0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${progressPct}%`,
                    bgcolor: progressPct === 100 ? '#66bb6a' : '#1976d2',
                    height: '100%', borderRadius: 4, transition: 'width 0.3s ease',
                  }} />
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t.yourName}</InputLabel>
              <Select
                value={selectedEmploye} label={t.yourName}
                onChange={e => setSelectedEmploye(e.target.value)}
              >
                {participants.map(p => (
                  <MenuItem key={p.idEmploye} value={p.idEmploye}>{p.nomComplet}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Sections */}
        {sections.map(section => {
          const sectionQuestions = questions.filter(q => q.sectionId === section.id);
          const sectionAnswered  = sectionQuestions.filter(q => answers[q.id]).length;

          return (
            <Card key={section.id} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{
                  bgcolor: '#1a1a2e', color: 'white',
                  px: 2, py: 1.5,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1,
                }}>
                  <Typography fontWeight={700} variant={isMobile ? 'body2' : 'body1'}>
                    {section.label}
                  </Typography>
                  <Box sx={{
                    px: 1, py: 0.25, borderRadius: 1,
                    bgcolor: sectionAnswered === sectionQuestions.length
                      ? '#66bb6a' : 'rgba(255,255,255,0.15)',
                    color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {sectionAnswered}/{sectionQuestions.length}
                  </Box>
                </Box>

                {sectionQuestions.map((q, idx) => (
                  <Box key={q.id}>
                    <Box sx={{
                      px: 2, py: 1.5,
                      bgcolor: idx % 2 === 0 ? 'transparent' : 'action.hover',
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      gap: isMobile ? 1.25 : 2,
                    }}>
                      <Typography variant="body2" sx={{
                        flex: isMobile ? undefined : 1, lineHeight: 1.5,
                        color: answers[q.id] ? 'text.primary' : 'text.secondary',
                        fontWeight: answers[q.id] ? 500 : 400,
                      }}>
                        {q.label}
                      </Typography>
                      <Box sx={{ width: isMobile ? '100%' : 280, flexShrink: 0 }}>
                        <ScoreToggle
                          questionId={q.id}
                          value={answers[q.id] ?? null}
                          onChange={handleAnswer}
                          scaleLabels={scaleLabels}
                          isMobile={isMobile}
                        />
                      </Box>
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
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
              fullWidth multiline rows={3}
              label={t.comment} value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              size={isMobile ? 'small' : 'medium'} sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              fullWidth variant="contained" size="large"
              onClick={handleSubmit} disabled={submitting}
              sx={{ py: { xs: 1.5, sm: 1.25 }, fontSize: { xs: '1rem', sm: '0.9375rem' } }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : t.submit}
            </Button>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}