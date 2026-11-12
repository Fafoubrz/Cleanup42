<?php
/**
 * Envoi des formulaires du site CleanUp42 par e-mail.
 *
 * Reçoit les formulaires « devis » (/demande-de-devis) et « rappel »
 * (bloc « On vous rappelle » en bas des pages), envoie la demande par e-mail
 * et en garde une copie dans un fichier CSV hors du dossier public.
 *
 * Appel JavaScript (en-tête X-Requested-With: fetch) : réponse JSON {ok: bool}.
 * Sans JavaScript : redirection vers /merci, ou page d'erreur simple.
 */
declare(strict_types=1);

date_default_timezone_set('Europe/Paris');
mb_internal_encoding('UTF-8');

// ---- Réglages -------------------------------------------------------------
const DESTINATAIRE   = 'contact@cleanup42.com';   // adresse qui reçoit les demandes
const NOM_EXPEDITEUR = 'Site CleanUp42';
const TELEPHONE      = '07 56 88 10 72';
const PHOTO_MAX      = 8 * 1024 * 1024;            // 8 Mo
const LIMITE_ENVOIS  = 8;                          // envois max par IP…
const LIMITE_FENETRE = 600;                        // …sur 10 minutes
// ---------------------------------------------------------------------------

const SERVICES = [
    'nettoyage-bureaux-saint-etienne'         => 'Bureaux et locaux',
    'nettoyage-vitres-saint-etienne'          => 'Vitrerie',
    'nettoyage-immeuble-saint-etienne'        => 'Immeubles et copropriétés',
    'nettoyage-fin-de-chantier-saint-etienne' => 'Fin de chantier',
    'nettoyage-sieges-bureau-saint-etienne'   => 'Sièges et textiles pros',
    'nettoyage-exterieur-saint-etienne'       => 'Extérieurs : terrasse, façade, toiture',
    'nettoyage-diogene-saint-etienne'         => 'Logement encombré (Diogène)',
    'autre'                                   => 'Autre demande',
];

$ajax = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch';

function repondre(bool $ok, string $erreur = '', int $code = 200): void
{
    global $ajax;
    http_response_code($code);
    if ($ajax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $erreur], JSON_UNESCAPED_UNICODE);
    } elseif ($ok) {
        header('Location: /merci', true, 303);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $msg = htmlspecialchars($erreur, ENT_QUOTES, 'UTF-8');
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>Envoi impossible | CleanUp42</title><meta name="robots" content="noindex">'
           . '<body style="font:16px/1.5 system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem">'
           . '<h1>Envoi impossible</h1><p>' . $msg . '</p>'
           . '<p>Appelez-nous au <a href="tel:+33756881072">' . TELEPHONE . '</a>.</p>'
           . '<p><a href="javascript:history.back()">Revenir au formulaire</a></p>';
    }
    exit;
}

/** Texte d'une ligne : sans retour à la ligne ni caractère de contrôle. */
function ligne(string $nom, int $max = 120): string
{
    $v = is_string($_POST[$nom] ?? null) ? $_POST[$nom] : '';
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

/** Texte libre : garde les retours à la ligne. */
function texte(string $nom, int $max = 3000): string
{
    $v = is_string($_POST[$nom] ?? null) ? $_POST[$nom] : '';
    $v = str_replace("\r\n", "\n", $v);
    $v = preg_replace('/[\x00-\x08\x0B-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

function entete(string $s): string
{
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    repondre(false, 'Méthode non autorisée.', 405);
}

// Champ piège anti-robots : rempli = robot. On fait semblant que tout va bien.
if (ligne('societe-web') !== '') {
    repondre(true);
}

$formulaire = ligne('form-name', 20);
if (!in_array($formulaire, ['devis', 'rappel'], true)) {
    repondre(false, 'Formulaire inconnu.', 400);
}

// Dossier de stockage hors du dossier public (public_html).
$dossier = dirname(__DIR__) . '/demandes-cleanup42';
if (!is_dir($dossier)) {
    @mkdir($dossier, 0700, true);
}
$stockage = is_dir($dossier) && is_writable($dossier);

// Limite d'envois par adresse IP.
if ($stockage) {
    $ip = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
    $fichierLimite = $dossier . '/limite-' . substr($ip, 0, 16) . '.txt';
    $now = time();
    $envois = array_filter(
        array_map('intval', @file($fichierLimite, FILE_IGNORE_NEW_LINES) ?: []),
        fn ($t) => $t > $now - LIMITE_FENETRE
    );
    if (count($envois) >= LIMITE_ENVOIS) {
        repondre(false, 'Trop de demandes envoyées en peu de temps. Réessayez dans quelques minutes.', 429);
    }
    $envois[] = $now;
    @file_put_contents($fichierLimite, implode("\n", $envois), LOCK_EX);
}

// ---- Lecture et contrôle des champs ---------------------------------------
$nom = ligne('nom', 100);
$tel = ligne('telephone', 30);
if ($nom === '' || $tel === '') {
    repondre(false, 'Indiquez votre nom et votre téléphone.', 422);
}
$chiffres = preg_replace('/\D/', '', $tel) ?? '';
if (strlen($chiffres) < 9 || strlen($chiffres) > 15 || !preg_match('/^[0-9 +().\-]+$/', $tel)) {
    repondre(false, 'Le numéro de téléphone ne semble pas valide.', 422);
}

$champs = ['Nom' => $nom, 'Téléphone' => $tel];
$email = '';
$photo = null;
$notePhoto = '';
$page = mb_substr(preg_replace('/[\x00-\x1F\x7F]+/', '', (string)($_SERVER['HTTP_REFERER'] ?? '')) ?? '', 0, 300);

if ($formulaire === 'devis') {
    $service = ligne('service', 80);
    $ville = ligne('ville', 80);
    $email = ligne('email', 160);
    if (!isset(SERVICES[$service])) {
        repondre(false, 'Choisissez une prestation.', 422);
    }
    if ($ville === '') {
        repondre(false, "Indiquez la ville d'intervention.", 422);
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        repondre(false, "L'adresse e-mail ne semble pas valide.", 422);
    }
    if (!isset($_POST['consentement'])) {
        repondre(false, 'Merci de cocher la case de consentement.', 422);
    }
    $champs += [
        'E-mail'         => $email !== '' ? $email : '(non renseigné)',
        'Prestation'     => SERVICES[$service],
        'Ville'          => $ville,
        'Type de client' => ligne('type_client', 60),
        'Société'        => ligne('societe', 120),
        'Surface'        => ligne('surface', 40),
        'Fréquence'      => ligne('frequence', 60),
        'Délai'          => ligne('delai', 60),
        'Date souhaitée' => ligne('date_souhaitee', 20),
    ];
    $message = texte('message');

    // Photo facultative.
    $f = $_FILES['photo'] ?? null;
    if (is_array($f) && ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
                  'image/gif' => 'gif', 'image/heic' => 'heic', 'image/heif' => 'heif'];
        if ($f['error'] !== UPLOAD_ERR_OK || $f['size'] > PHOTO_MAX) {
            $notePhoto = 'Le client a joint une photo trop lourde (plus de 8 Mo) : elle n\'a pas été transmise.';
        } else {
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']) ?: '';
            if (isset($types[$mime]) && is_uploaded_file($f['tmp_name'])) {
                $photo = ['mime' => $mime, 'nom' => 'photo-client.' . $types[$mime],
                          'data' => (string)file_get_contents($f['tmp_name'])];
            } else {
                $notePhoto = 'Le fichier joint n\'est pas une image : il n\'a pas été transmis.';
            }
        }
    }
    $sujet = 'Demande de devis : ' . SERVICES[$service] . ' – ' . $ville . ' – ' . $nom;
} else {
    $message = '';
    $sujet = 'Demande de rappel – ' . $nom . ' – ' . $tel;
}

// ---- Identifiant du clic Google (envoyé seulement si le visiteur a accepté les cookies) ----
$clic = '';
foreach (['gclid', 'gbraid', 'wbraid'] as $k) {
    $v = ligne($k, 200);
    if ($v !== '' && preg_match('/^[A-Za-z0-9_-]{10,200}$/', $v)) { $clic = $k . '=' . $v; break; }
}
if ($clic !== '') {
    $champs['Clic Google'] = $clic;
}

// ---- Corps du message -----------------------------------------------------
$corps = ($formulaire === 'devis' ? "Nouvelle demande de devis depuis le site.\n\n" : "Un visiteur demande à être rappelé.\n\n");
foreach ($champs as $libelle => $valeur) {
    if ($valeur !== '') {
        $l = $libelle . ' :';
        $corps .= $l . str_repeat(' ', max(1, 17 - mb_strlen($l))) . $valeur . "\n";
    }
}
if ($message !== '') {
    $corps .= "\nPrécisions :\n" . $message . "\n";
}
if ($notePhoto !== '') {
    $corps .= "\n" . $notePhoto . "\n";
}
$corps .= "\n--\nEnvoyé le " . date('d/m/Y à H:i') . ($page !== '' ? "\nPage : " . $page : '') . "\n";

// ---- Envoi ----------------------------------------------------------------
$hote = strtolower(preg_replace('/[^A-Za-z0-9.\-]/', '', (string)($_SERVER['SERVER_NAME'] ?? '')) ?? '');
$hote = preg_replace('/^www\./', '', $hote) ?: 'localhost';
$expediteur = 'noreply@' . $hote;

$entetes = [
    'From: ' . entete(NOM_EXPEDITEUR) . ' <' . $expediteur . '>',
    'MIME-Version: 1.0',
];
if ($email !== '') {
    $entetes[] = 'Reply-To: ' . entete($nom) . ' <' . $email . '>';
}

if ($photo) {
    $frontiere = 'cu42-' . bin2hex(random_bytes(12));
    $entetes[] = 'Content-Type: multipart/mixed; boundary="' . $frontiere . '"';
    $contenu = "--$frontiere\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($corps)) . "\r\n"
        . "--$frontiere\r\n"
        . 'Content-Type: ' . $photo['mime'] . '; name="' . $photo['nom'] . "\"\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . 'Content-Disposition: attachment; filename="' . $photo['nom'] . "\"\r\n\r\n"
        . chunk_split(base64_encode($photo['data'])) . "\r\n"
        . "--$frontiere--\r\n";
} else {
    $entetes[] = 'Content-Type: text/plain; charset=UTF-8';
    $entetes[] = 'Content-Transfer-Encoding: base64';
    $contenu = chunk_split(base64_encode($corps));
}

$envoye = @mail(DESTINATAIRE, entete($sujet), $contenu, implode("\r\n", $entetes), '-f' . $expediteur);

// ---- Copie de secours (CSV hors du dossier public) ------------------------
$archive = false;
if ($stockage) {
    $csv = $dossier . '/demandes.csv';
    $nouveau = !is_file($csv);
    if ($fh = @fopen($csv, 'ab')) {
        flock($fh, LOCK_EX);
        if ($nouveau) {
            fwrite($fh, "\xEF\xBB\xBF"); // BOM : accents corrects dans Excel
            fputcsv($fh, ['Date', 'Formulaire', 'E-mail envoyé', 'Nom', 'Téléphone', 'E-mail', 'Prestation',
                          'Ville', 'Type de client', 'Société', 'Surface', 'Fréquence', 'Délai',
                          'Date souhaitée', 'Précisions', 'Page', 'Clic Google'], ';', '"', '');
        }
        $c = fn ($k) => $champs[$k] ?? '';
        $ligneCsv = [date('Y-m-d H:i:s'), $formulaire, $envoye ? 'oui' : 'NON', $nom, $tel, $email,
                     $c('Prestation'), $c('Ville'), $c('Type de client'), $c('Société'), $c('Surface'),
                     $c('Fréquence'), $c('Délai'), $c('Date souhaitée'), $message, $page, $clic];
        // Empêche Excel d'interpréter une valeur comme une formule.
        $ligneCsv = array_map(fn ($v) => preg_match('/^[=+\-@\t]/', (string)$v) ? "'" . $v : $v, $ligneCsv);
        fputcsv($fh, $ligneCsv, ';', '"', '');
        flock($fh, LOCK_UN);
        fclose($fh);
        $archive = true;
    }
}

if (!$envoye && !$archive) {
    repondre(false, "Votre demande n'a pas pu être envoyée.", 500);
}
repondre(true);
