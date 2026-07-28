/**
 * Emoji data layer.
 *
 * Deliberately *not* a full Unicode set. `emoji-datasource` and friends weigh
 * 400 KB–1 MB parsed, which is a poor trade for a design-system package whose
 * whole point is being a thin layer over CSS. This is a curated ~470-glyph set
 * covering the eight standard categories — the ones people actually reach for
 * in a work conversation — stored in a compact pipe-delimited form and parsed
 * once at module load.
 *
 * If you need the complete set, `EMOJI` is a plain array: concatenate your own
 * entries onto a copy and pass it to `<EmojiPicker emoji={…} />`.
 *
 * Compact entry format:  `[+]char|name|space separated keywords`
 *   `+` prefix  the glyph accepts a skin-tone modifier
 *   name        the canonical label; also the source of the shortcode
 *   keywords    search aliases. The FIRST keyword doubles as the short alias,
 *               so `:+1:` and `:tada:` resolve the way people expect.
 */

// ── Categories ────────────────────────────────────────────────

export type EmojiCategoryId =
  | 'recent'
  | 'smileys'
  | 'nature'
  | 'food'
  | 'activity'
  | 'travel'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface EmojiCategory {
  id: EmojiCategoryId;
  /** Sentence-case label, per the system's copy rules. */
  label: string;
  /** Glyph used as the category's tab in the picker rail. */
  glyph: string;
}

/** Category tabs in picker order. `recent` is synthetic — it has no entries. */
export const EMOJI_CATEGORIES: readonly EmojiCategory[] = [
  { id: 'recent', label: 'Frequently used', glyph: '🕘' },
  { id: 'smileys', label: 'Smileys and people', glyph: '😀' },
  { id: 'nature', label: 'Animals and nature', glyph: '🐻' },
  { id: 'food', label: 'Food and drink', glyph: '🍎' },
  { id: 'activity', label: 'Activity', glyph: '⚽' },
  { id: 'travel', label: 'Travel and places', glyph: '✈️' },
  { id: 'objects', label: 'Objects', glyph: '💡' },
  { id: 'symbols', label: 'Symbols', glyph: '🔷' },
  { id: 'flags', label: 'Flags', glyph: '🏁' },
];

// ── Skin tones ────────────────────────────────────────────────

export type SkinToneId = 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

export interface SkinTone {
  id: SkinToneId;
  label: string;
  /** The Fitzpatrick modifier codepoint, or '' for the yellow default. */
  modifier: string;
  /** Swatch colour for the tone selector. */
  swatch: string;
}

export const SKIN_TONES: readonly SkinTone[] = [
  { id: 'default', label: 'Default', modifier: '', swatch: '#FFC93C' },
  { id: 'light', label: 'Light', modifier: '\u{1F3FB}', swatch: '#F7D7C4' },
  { id: 'medium-light', label: 'Medium light', modifier: '\u{1F3FC}', swatch: '#D8B094' },
  { id: 'medium', label: 'Medium', modifier: '\u{1F3FD}', swatch: '#BB9167' },
  { id: 'medium-dark', label: 'Medium dark', modifier: '\u{1F3FE}', swatch: '#8E562E' },
  { id: 'dark', label: 'Dark', modifier: '\u{1F3FF}', swatch: '#613D30' },
];

const TONE_BY_ID = new Map<SkinToneId, SkinTone>(SKIN_TONES.map((t) => [t.id, t]));

// ── The set ───────────────────────────────────────────────────

const RAW: Record<Exclude<EmojiCategoryId, 'recent'>, string[]> = {
  smileys: [
    '😀|grinning face|grin smile happy',
    '😃|grinning face with big eyes|smiley happy joy',
    '😄|grinning face with smiling eyes|smile happy joy laugh',
    '😁|beaming face with smiling eyes|grin happy',
    '😆|grinning squinting face|laughing satisfied haha',
    '😅|grinning face with sweat|sweat_smile relief nervous',
    '🤣|rolling on the floor laughing|rofl lol hilarious',
    '😂|face with tears of joy|joy laughing crying funny',
    '🙂|slightly smiling face|slight_smile polite',
    '🙃|upside down face|upside_down silly sarcasm',
    '😉|winking face|wink flirt joke',
    '😊|smiling face with smiling eyes|blush happy shy',
    '😇|smiling face with halo|innocent angel saint',
    '🥰|smiling face with hearts|in_love adore crush',
    '😍|smiling face with heart eyes|heart_eyes love crush',
    '🤩|star struck|starstruck amazed wow',
    '😘|face blowing a kiss|kissing_heart flirt love',
    '😗|kissing face|kissing',
    '😚|kissing face with closed eyes|kissing_closed_eyes',
    '🥲|smiling face with tear|grateful touched proud',
    '😋|face savoring food|yum delicious tasty',
    '😛|face with tongue|stuck_out_tongue playful',
    '😜|winking face with tongue|zany joking playful',
    '🤪|zany face|goofy wild crazy',
    '🤨|face with raised eyebrow|skeptical suspicious doubt',
    '🧐|face with monocle|inspect scrutiny',
    '🤓|nerd face|nerd geek smart glasses',
    '😎|smiling face with sunglasses|sunglasses cool',
    '🥳|partying face|party celebrate birthday',
    '😏|smirking face|smirk smug sly',
    '😒|unamused face|unamused meh unimpressed',
    '😞|disappointed face|disappointed sad let_down',
    '😔|pensive face|pensive sad quiet',
    '😟|worried face|worried concerned',
    '🙁|slightly frowning face|slight_frown',
    '😣|persevering face|persevere struggling',
    '😖|confounded face|confounded frustrated',
    '😫|tired face|tired exhausted',
    '😩|weary face|weary fed_up',
    '🥺|pleading face|pleading begging puppy_eyes',
    '😢|crying face|cry sad tear',
    '😭|loudly crying face|sob bawling upset',
    '😤|face with steam from nose|triumph determined huff',
    '😠|angry face|angry mad',
    '😡|enraged face|rage furious',
    '🤬|face with symbols on mouth|cursing swearing',
    '🤯|exploding head|mind_blown shocked',
    '😳|flushed face|flushed embarrassed',
    '🥵|hot face|overheated sweating heat',
    '🥶|cold face|freezing frozen',
    '😱|face screaming in fear|scream shocked horror',
    '😨|fearful face|fearful scared',
    '😰|anxious face with sweat|anxious nervous',
    '😥|sad but relieved face|disappointed_relieved phew',
    '😓|downcast face with sweat|sweat tired',
    '🤗|hugging face|hugs thanks welcome',
    '🤔|thinking face|thinking hmm consider',
    '🫡|saluting face|salute yes_sir respect',
    '🤭|face with hand over mouth|oops giggle secret',
    '🤫|shushing face|shush quiet secret',
    '🤥|lying face|lying pinocchio',
    '😶|face without mouth|no_mouth speechless blank',
    '🫥|dotted line face|invisible hiding',
    '😐|neutral face|neutral blank deadpan',
    '😑|expressionless face|expressionless unimpressed',
    '😬|grimacing face|grimacing awkward yikes',
    '🙄|face with rolling eyes|roll_eyes annoyed',
    '😯|hushed face|hushed surprised',
    '😦|frowning face with open mouth|frowning',
    '😧|anguished face|anguished',
    '😮|face with open mouth|open_mouth surprised oh',
    '😲|astonished face|astonished shocked gasp',
    '🥱|yawning face|yawn tired bored',
    '😴|sleeping face|sleeping zzz asleep',
    '😪|sleepy face|sleepy drowsy',
    '😵|face with crossed out eyes|dizzy knocked_out',
    '🤐|zipper mouth face|zipper_mouth silence',
    '🥴|woozy face|woozy tipsy dazed',
    '🤢|nauseated face|nauseated sick gross',
    '🤮|face vomiting|vomiting sick',
    '🤧|sneezing face|sneezing sick tissue',
    '😷|face with medical mask|mask sick health',
    '🤒|face with thermometer|thermometer fever ill',
    '🤕|face with head bandage|bandage hurt injured',
    '🤑|money mouth face|money_mouth rich profit',
    '🤠|cowboy hat face|cowboy yeehaw',
    '😈|smiling face with horns|devil mischief',
    '👿|angry face with horns|imp devil',
    '👹|ogre|ogre monster',
    '💀|skull|skull dead danger',
    '☠️|skull and crossbones|poison danger fatal',
    '👻|ghost|ghost boo halloween',
    '👽|alien|alien ufo extraterrestrial',
    '🤖|robot|robot bot automation ai',
    '💩|pile of poo|poop crap',
    '🤡|clown face|clown joker',
    '😺|grinning cat|smiley_cat',
    '😻|smiling cat with heart eyes|heart_eyes_cat',
    '😹|cat with tears of joy|joy_cat',
    '🙈|see no evil monkey|see_no_evil hide shy',
    '🙉|hear no evil monkey|hear_no_evil',
    '🙊|speak no evil monkey|speak_no_evil oops',
    '+👋|waving hand|wave hello hi bye greeting',
    '+🤚|raised back of hand|raised_back_of_hand',
    '+🖐️|hand with fingers splayed|hand_splayed five',
    '+✋|raised hand|raised_hand stop high_five',
    '+🖖|vulcan salute|vulcan spock',
    '+👌|ok hand|ok perfect good',
    '+🤌|pinched fingers|pinched italian',
    '+🤏|pinching hand|pinching small little',
    '+✌️|victory hand|v peace two',
    '+🤞|crossed fingers|crossed_fingers luck hopeful',
    '+🫰|hand with index finger and thumb crossed|finger_heart money',
    '+🤟|love you gesture|love_you_gesture',
    '+🤘|sign of the horns|metal rock',
    '+🤙|call me hand|call_me shaka',
    '+👈|backhand index pointing left|point_left',
    '+👉|backhand index pointing right|point_right',
    '+👆|backhand index pointing up|point_up_2',
    '+👇|backhand index pointing down|point_down',
    '+☝️|index pointing up|point_up one',
    '+🫵|index pointing at the viewer|point_at_viewer you',
    '+👍|thumbs up|+1 thumbsup yes approve like good lgtm',
    '+👎|thumbs down|-1 thumbsdown no disapprove',
    '+✊|raised fist|fist power resist',
    '+👊|oncoming fist|punch fist_bump',
    '+🤛|left facing fist|left_facing_fist',
    '+🤜|right facing fist|right_facing_fist',
    '+👏|clapping hands|clap applause bravo praise',
    '+🙌|raising hands|raised_hands hooray celebrate',
    '+🫶|heart hands|heart_hands love',
    '+👐|open hands|open_hands hug',
    '+🤲|palms up together|palms_up please',
    '🤝|handshake|handshake deal agreement partner',
    '+🙏|folded hands|pray thanks please namaste',
    '+✍️|writing hand|writing sign note',
    '+💅|nail polish|nail_care manicure',
    '+💪|flexed biceps|muscle strong strength',
    '🫀|anatomical heart|anatomical_heart cardio',
    '🧠|brain|brain smart think',
    '+👀|eyes|eyes look watch review looking',
    '👁️|eye|eye watch',
    '👄|mouth|mouth lips',
    '🦻|ear with hearing aid|hearing_aid accessibility',
    '+👶|baby|baby infant newborn',
    '+🧒|child|child kid',
    '+👦|boy|boy',
    '+👧|girl|girl',
    '+🧑|person|person adult',
    '+👨|man|man',
    '+👩|woman|woman',
    '+🧓|older person|older_person elder',
    '+👮|police officer|police cop',
    '+🕵️|detective|detective spy investigate',
    '+👷|construction worker|construction_worker builder',
    '+🧑‍💼|office worker|office_worker business',
    '+🧑‍💻|technologist|technologist developer engineer coder',
    '+🧑‍🔬|scientist|scientist research lab',
    '+🧑‍🏫|teacher|teacher educator',
    '+🧑‍⚕️|health worker|health_worker doctor nurse',
    '+🧑‍🍳|cook|cook chef',
    '+🧑‍🌾|farmer|farmer agriculture',
    '+🧑‍🔧|mechanic|mechanic repair',
    '+🦸|superhero|superhero hero',
    '+🕺|man dancing|man_dancing dance',
    '+💃|woman dancing|dancer dance',
    '+🧗|person climbing|climbing climb',
    '+🧘|person in lotus position|lotus_position meditate yoga calm',
    '+🚶|person walking|walking walk',
    '+🏃|person running|runner run sprint deadline',
    '+🤷|person shrugging|shrug dunno idk',
    '+🤦|person facepalming|facepalm ugh',
    '+🙅|person gesturing no|no_good nope refuse',
    '+🙆|person gesturing ok|ok_person yes',
    '+💁|person tipping hand|tipping_hand information sassy',
    '+🙋|person raising hand|raising_hand question volunteer me',
    '+🧏|deaf person|deaf accessibility',
    '+🙇|person bowing|bow sorry respect',
    '👪|family|family household',
    '🫂|people hugging|people_hugging support comfort',
    '👣|footprints|footprints steps',
  ],
  nature: [
    '🐶|dog face|dog puppy',
    '🐱|cat face|cat kitten',
    '🐭|mouse face|mouse',
    '🐹|hamster|hamster',
    '🐰|rabbit face|rabbit bunny',
    '🦊|fox|fox',
    '🐻|bear|bear',
    '🐼|panda|panda',
    '🐻‍❄️|polar bear|polar_bear arctic',
    '🐨|koala|koala',
    '🐯|tiger face|tiger',
    '🦁|lion|lion',
    '🐮|cow face|cow',
    '🐷|pig face|pig',
    '🐸|frog|frog',
    '🐵|monkey face|monkey',
    '🙈|see no evil monkey|see_no_evil',
    '🐔|chicken|chicken hen',
    '🐧|penguin|penguin',
    '🐦|bird|bird',
    '🐤|baby chick|baby_chick hatchling',
    '🦆|duck|duck',
    '🦅|eagle|eagle',
    '🦉|owl|owl wise night',
    '🦇|bat|bat',
    '🐺|wolf|wolf',
    '🐗|boar|boar',
    '🐴|horse face|horse',
    '🦄|unicorn|unicorn magic rare',
    '🐝|honeybee|bee honey busy',
    '🪲|beetle|beetle',
    '🐛|bug|bug caterpillar defect',
    '🦋|butterfly|butterfly transform',
    '🐌|snail|snail slow',
    '🐞|lady beetle|lady_beetle ladybug',
    '🐜|ant|ant',
    '🕷️|spider|spider',
    '🕸️|spider web|spider_web',
    '🦂|scorpion|scorpion',
    '🐢|turtle|turtle slow',
    '🐍|snake|snake',
    '🦎|lizard|lizard gecko',
    '🦖|t rex|t_rex dinosaur',
    '🐙|octopus|octopus',
    '🦑|squid|squid',
    '🦐|shrimp|shrimp',
    '🦞|lobster|lobster',
    '🦀|crab|crab',
    '🐡|blowfish|blowfish',
    '🐠|tropical fish|tropical_fish',
    '🐟|fish|fish',
    '🐬|dolphin|dolphin',
    '🐳|spouting whale|whale',
    '🦈|shark|shark',
    '🐊|crocodile|crocodile',
    '🐅|tiger|tiger_body',
    '🦓|zebra|zebra',
    '🦍|gorilla|gorilla',
    '🐘|elephant|elephant',
    '🦏|rhinoceros|rhinoceros rhino',
    '🐪|camel|camel',
    '🦒|giraffe|giraffe',
    '🐄|cow|cow_body cattle',
    '🐖|pig|pig_body',
    '🐑|ewe|sheep wool',
    '🐐|goat|goat',
    '🦌|deer|deer',
    '🐕|dog|dog_body',
    '🐩|poodle|poodle',
    '🦮|guide dog|guide_dog accessibility',
    '🐈|cat|cat_body',
    '🐓|rooster|rooster',
    '🦃|turkey|turkey',
    '🦚|peacock|peacock',
    '🦜|parrot|parrot',
    '🦢|swan|swan',
    '🕊️|dove|dove peace',
    '🐇|rabbit|rabbit_body',
    '🦔|hedgehog|hedgehog',
    '🐿️|chipmunk|chipmunk squirrel',
    '🦫|beaver|beaver',
    '🦥|sloth|sloth slow',
    '🐾|paw prints|paw_prints pets',
    '🌵|cactus|cactus desert',
    '🎄|christmas tree|christmas_tree holiday',
    '🌲|evergreen tree|evergreen_tree pine',
    '🌳|deciduous tree|deciduous_tree tree',
    '🌴|palm tree|palm_tree tropical vacation',
    '🪴|potted plant|potted_plant houseplant',
    '🌱|seedling|seedling sprout new growth',
    '🌿|herb|herb leaf',
    '☘️|shamrock|shamrock',
    '🍀|four leaf clover|four_leaf_clover luck',
    '🎍|pine decoration|pine_decoration',
    '🍃|leaf fluttering in wind|leaves wind',
    '🍂|fallen leaf|fallen_leaf autumn',
    '🍁|maple leaf|maple_leaf canada autumn',
    '🌾|sheaf of rice|sheaf_of_rice grain harvest',
    '💐|bouquet|bouquet flowers thanks',
    '🌷|tulip|tulip',
    '🌹|rose|rose love',
    '🥀|wilted flower|wilted_flower',
    '🌺|hibiscus|hibiscus',
    '🌸|cherry blossom|cherry_blossom sakura spring',
    '🌼|blossom|blossom',
    '🌻|sunflower|sunflower',
    '🌞|sun with face|sun_with_face',
    '🌝|full moon face|full_moon_face',
    '🌚|new moon face|new_moon_face',
    '🌙|crescent moon|crescent_moon night',
    '🌛|first quarter moon face|first_quarter_moon_face',
    '⭐|star|star favourite',
    '🌟|glowing star|star2 sparkle shine',
    '✨|sparkles|sparkles magic new shiny clean',
    '⚡|high voltage|zap lightning power fast',
    '☄️|comet|comet',
    '💥|collision|boom explosion crash',
    '🔥|fire|fire hot lit urgent burning',
    '🌪️|tornado|tornado',
    '🌈|rainbow|rainbow pride',
    '☀️|sun|sunny clear weather',
    '🌤️|sun behind small cloud|partly_sunny',
    '⛅|sun behind cloud|partly_cloudy',
    '☁️|cloud|cloud overcast',
    '🌧️|cloud with rain|rain wet',
    '⛈️|cloud with lightning and rain|thunder_storm',
    '🌨️|cloud with snow|cloud_snow',
    '❄️|snowflake|snowflake cold winter freeze',
    '☃️|snowman|snowman winter',
    '💧|droplet|droplet water drop',
    '🌊|water wave|ocean wave sea',
    '🌍|globe showing europe africa|earth_africa world global',
    '🌎|globe showing americas|earth_americas world',
    '🌏|globe showing asia australia|earth_asia world',
    '🪐|ringed planet|ringed_planet saturn space',
  ],
  food: [
    '🍏|green apple|green_apple',
    '🍎|red apple|apple fruit',
    '🍐|pear|pear',
    '🍊|tangerine|tangerine orange citrus',
    '🍋|lemon|lemon citrus sour',
    '🍌|banana|banana',
    '🍉|watermelon|watermelon summer',
    '🍇|grapes|grapes',
    '🍓|strawberry|strawberry',
    '🫐|blueberries|blueberries',
    '🍈|melon|melon',
    '🍒|cherries|cherries',
    '🍑|peach|peach',
    '🥭|mango|mango',
    '🍍|pineapple|pineapple',
    '🥥|coconut|coconut',
    '🥝|kiwi fruit|kiwi',
    '🍅|tomato|tomato',
    '🍆|eggplant|eggplant aubergine',
    '🥑|avocado|avocado',
    '🥦|broccoli|broccoli',
    '🥬|leafy green|leafy_green lettuce',
    '🥒|cucumber|cucumber',
    '🌶️|hot pepper|hot_pepper spicy chilli',
    '🌽|ear of corn|corn maize',
    '🥕|carrot|carrot',
    '🧄|garlic|garlic',
    '🧅|onion|onion',
    '🥔|potato|potato',
    '🍠|roasted sweet potato|sweet_potato',
    '🥐|croissant|croissant',
    '🥯|bagel|bagel',
    '🍞|bread|bread loaf',
    '🥖|baguette bread|baguette',
    '🥨|pretzel|pretzel',
    '🧇|waffle|waffle',
    '🥞|pancakes|pancakes breakfast',
    '🧈|butter|butter',
    '🧀|cheese wedge|cheese',
    '🍳|cooking|fried_egg cooking breakfast',
    '🥓|bacon|bacon',
    '🥩|cut of meat|cut_of_meat steak',
    '🍗|poultry leg|poultry_leg chicken',
    '🍖|meat on bone|meat_on_bone',
    '🌭|hot dog|hotdog',
    '🍔|hamburger|hamburger burger',
    '🍟|french fries|fries chips',
    '🍕|pizza|pizza',
    '🥪|sandwich|sandwich lunch',
    '🌮|taco|taco',
    '🌯|burrito|burrito',
    '🥙|stuffed flatbread|stuffed_flatbread',
    '🧆|falafel|falafel',
    '🥚|egg|egg',
    '🥘|shallow pan of food|paella pan',
    '🍲|pot of food|stew soup',
    '🥣|bowl with spoon|bowl_with_spoon cereal',
    '🥗|green salad|salad healthy',
    '🍿|popcorn|popcorn movie',
    '🧂|salt|salt',
    '🥫|canned food|canned_food',
    '🍱|bento box|bento lunch',
    '🍘|rice cracker|rice_cracker',
    '🍙|rice ball|rice_ball onigiri',
    '🍚|cooked rice|rice',
    '🍛|curry rice|curry',
    '🍜|steaming bowl|ramen noodles',
    '🍝|spaghetti|spaghetti pasta',
    '🍠|sweet potato|roasted_sweet_potato',
    '🍢|oden|oden',
    '🍣|sushi|sushi',
    '🍤|fried shrimp|fried_shrimp tempura',
    '🥟|dumpling|dumpling',
    '🥠|fortune cookie|fortune_cookie',
    '🍥|fish cake with swirl|fish_cake',
    '🥮|moon cake|moon_cake',
    '🍡|dango|dango',
    '🍦|soft ice cream|icecream',
    '🍧|shaved ice|shaved_ice',
    '🍨|ice cream|ice_cream',
    '🍩|doughnut|doughnut donut',
    '🍪|cookie|cookie biscuit',
    '🎂|birthday cake|birthday cake celebrate',
    '🍰|shortcake|cake slice',
    '🧁|cupcake|cupcake',
    '🥧|pie|pie',
    '🍫|chocolate bar|chocolate',
    '🍬|candy|candy sweets',
    '🍭|lollipop|lollipop',
    '🍮|custard|custard flan',
    '🍯|honey pot|honey_pot',
    '🍼|baby bottle|baby_bottle milk',
    '🥛|glass of milk|milk',
    '☕|hot beverage|coffee tea morning',
    '🫖|teapot|teapot',
    '🍵|teacup without handle|tea green_tea',
    '🧉|mate|mate',
    '🧊|ice|ice cube cold',
    '🥤|cup with straw|cup_with_straw soda',
    '🧋|bubble tea|bubble_tea boba',
    '🍺|beer mug|beer',
    '🍻|clinking beer mugs|beers cheers',
    '🥂|clinking glasses|champagne cheers celebrate toast',
    '🍷|wine glass|wine',
    '🥃|tumbler glass|whisky',
    '🍸|cocktail glass|cocktail martini',
    '🍹|tropical drink|tropical_drink vacation',
    '🍾|bottle with popping cork|champagne_bottle launch celebrate',
    '🥄|spoon|spoon',
    '🍴|fork and knife|fork_and_knife eat',
    '🍽️|fork and knife with plate|plate dinner',
    '🥢|chopsticks|chopsticks',
    '🥡|takeout box|takeout_box',
  ],
  activity: [
    '⚽|soccer ball|soccer football',
    '🏀|basketball|basketball',
    '🏈|american football|football',
    '⚾|baseball|baseball',
    '🥎|softball|softball',
    '🎾|tennis|tennis',
    '🏐|volleyball|volleyball',
    '🏉|rugby football|rugby',
    '🥏|flying disc|flying_disc frisbee',
    '🎱|pool 8 ball|8ball pool billiards',
    '🏓|ping pong|ping_pong table_tennis',
    '🏸|badminton|badminton',
    '🥊|boxing glove|boxing_glove fight',
    '🥋|martial arts uniform|martial_arts karate',
    '⛳|flag in hole|golf',
    '🏹|bow and arrow|bow_and_arrow archery target',
    '🎣|fishing pole|fishing_pole',
    '🤿|diving mask|diving_mask',
    '🎽|running shirt|running_shirt race',
    '🛹|skateboard|skateboard',
    '🛼|roller skate|roller_skate',
    '🎿|skis|ski',
    '🛷|sled|sled',
    '⛸️|ice skate|ice_skate',
    '🏂|snowboarder|snowboarder',
    '+🏄|person surfing|surfer surf',
    '+🏊|person swimming|swimmer swim',
    '+🚴|person biking|bicyclist cycling',
    '+🏋️|person lifting weights|weight_lifting gym',
    '+⛹️|person bouncing ball|bouncing_ball',
    '+🤸|person doing cartwheel|cartwheel',
    '+🤾|person playing handball|handball',
    '+🤺|person fencing|fencing',
    '🏆|trophy|trophy win award champion',
    '🥇|1st place medal|first_place gold win',
    '🥈|2nd place medal|second_place silver',
    '🥉|3rd place medal|third_place bronze',
    '🏅|sports medal|medal award',
    '🎖️|military medal|military_medal honour',
    '🎯|bullseye|dart target goal aim',
    '🪀|yo yo|yo_yo',
    '🪁|kite|kite',
    '🎮|video game|video_game gaming controller',
    '🕹️|joystick|joystick arcade',
    '🎲|game die|game_die dice random luck',
    '🧩|puzzle piece|puzzle_piece fit solve',
    '♟️|chess pawn|chess_pawn strategy',
    '🎰|slot machine|slot_machine gamble',
    '🎳|bowling|bowling',
    '🎨|artist palette|art design paint creative',
    '🎭|performing arts|performing_arts theatre drama',
    '🎪|circus tent|circus_tent',
    '🎤|microphone|microphone sing podcast',
    '🎧|headphone|headphones music listen focus',
    '🎼|musical score|musical_score',
    '🎵|musical note|musical_note music',
    '🎶|musical notes|notes music',
    '🎹|musical keyboard|musical_keyboard piano',
    '🥁|drum|drum',
    '🎷|saxophone|saxophone',
    '🎺|trumpet|trumpet',
    '🎸|guitar|guitar',
    '🪕|banjo|banjo',
    '🎻|violin|violin',
    '🎬|clapper board|clapper film movie action',
    '🎟️|admission tickets|tickets',
    '🎫|ticket|ticket',
    '🎡|ferris wheel|ferris_wheel',
    '🎢|roller coaster|roller_coaster',
    '🎠|carousel horse|carousel_horse',
    '🎉|party popper|tada celebrate launch shipped party congrats',
    '🎊|confetti ball|confetti_ball celebrate',
    '🎈|balloon|balloon party',
    '🎁|wrapped gift|gift present',
    '🎀|ribbon|ribbon bow',
    '🪄|magic wand|magic_wand magic',
    '🎃|jack o lantern|jack_o_lantern halloween',
    '🧨|firecracker|firecracker',
    '🎆|fireworks|fireworks celebrate',
  ],
  travel: [
    '🚗|automobile|car auto drive',
    '🚕|taxi|taxi cab',
    '🚙|sport utility vehicle|suv',
    '🚌|bus|bus',
    '🚎|trolleybus|trolleybus',
    '🏎️|racing car|racing_car fast speed',
    '🚓|police car|police_car',
    '🚑|ambulance|ambulance emergency',
    '🚒|fire engine|fire_engine',
    '🚐|minibus|minibus van',
    '🛻|pickup truck|pickup_truck',
    '🚚|delivery truck|delivery_truck shipping',
    '🚛|articulated lorry|articulated_lorry freight',
    '🚜|tractor|tractor farm',
    '🛵|motor scooter|motor_scooter',
    '🏍️|motorcycle|motorcycle',
    '🛺|auto rickshaw|auto_rickshaw tuktuk',
    '🚲|bicycle|bike bicycle',
    '🛴|kick scooter|kick_scooter',
    '🚏|bus stop|busstop',
    '🛣️|motorway|motorway highway',
    '🛤️|railway track|railway_track',
    '🚉|station|station',
    '🚆|train|train',
    '🚄|high speed train|bullettrain fast',
    '🚊|tram|tram',
    '🚝|monorail|monorail',
    '🚇|metro|metro subway',
    '🚟|suspension railway|suspension_railway',
    '🚀|rocket|rocket launch ship deploy fast growth',
    '🛸|flying saucer|flying_saucer ufo',
    '🚁|helicopter|helicopter',
    '🛩️|small airplane|small_airplane',
    '✈️|airplane|airplane flight travel',
    '🛫|airplane departure|airplane_departure takeoff',
    '🛬|airplane arrival|airplane_arrival landing',
    '🪂|parachute|parachute',
    '💺|seat|seat',
    '🛶|canoe|canoe',
    '⛵|sailboat|sailboat',
    '🚤|speedboat|speedboat',
    '🛳️|passenger ship|passenger_ship cruise',
    '⛴️|ferry|ferry',
    '🚢|ship|ship cargo',
    '⚓|anchor|anchor',
    '🪝|hook|hook',
    '⛽|fuel pump|fuelpump petrol',
    '🚧|construction|construction wip roadworks',
    '🚦|vertical traffic light|traffic_light',
    '🗺️|world map|world_map roadmap',
    '🗿|moai|moai',
    '🗽|statue of liberty|statue_of_liberty',
    '🗼|tokyo tower|tokyo_tower',
    '🏰|castle|castle',
    '🏯|japanese castle|japanese_castle',
    '🏟️|stadium|stadium',
    '🎡|ferris wheel|ferris_wheel_travel',
    '🏛️|classical building|classical_building government',
    '🏗️|building construction|building_construction wip',
    '🧱|brick|bricks wall',
    '🪨|rock|rock',
    '🏘️|houses|houses neighbourhood',
    '🏚️|derelict house|derelict_house',
    '🏠|house|house home',
    '🏡|house with garden|house_with_garden',
    '🏢|office building|office office_building work',
    '🏣|japanese post office|japanese_post_office',
    '🏥|hospital|hospital',
    '🏦|bank|bank finance',
    '🏨|hotel|hotel',
    '🏪|convenience store|convenience_store shop',
    '🏫|school|school',
    '🏭|factory|factory plant industry',
    '🏬|department store|department_store retail',
    '💒|wedding|wedding',
    '⛪|church|church',
    '🕌|mosque|mosque',
    '🛕|hindu temple|hindu_temple',
    '🕍|synagogue|synagogue',
    '⛺|tent|tent camping',
    '🏕️|camping|camping',
    '🏖️|beach with umbrella|beach vacation',
    '🏝️|desert island|desert_island',
    '🏜️|desert|desert',
    '🌋|volcano|volcano',
    '⛰️|mountain|mountain',
    '🏔️|snow capped mountain|mountain_snow',
    '🗻|mount fuji|mount_fuji',
    '🏞️|national park|national_park',
    '🌅|sunrise|sunrise morning',
    '🌄|sunrise over mountains|sunrise_over_mountains',
    '🌇|sunset|sunset',
    '🌆|cityscape at dusk|city_dusk',
    '🏙️|cityscape|cityscape city skyline',
    '🌃|night with stars|night_with_stars',
    '🌌|milky way|milky_way galaxy',
    '🎇|sparkler|sparkler',
    '🌁|foggy|foggy fog',
    '♨️|hot springs|hotsprings onsen',
    '🧭|compass|compass direction navigate',
    '🧳|luggage|luggage travel trip',
  ],
  objects: [
    '⌚|watch|watch time',
    '📱|mobile phone|iphone mobile phone',
    '📲|mobile phone with arrow|calling',
    '💻|laptop|computer laptop code work',
    '⌨️|keyboard|keyboard typing',
    '🖥️|desktop computer|desktop_computer',
    '🖨️|printer|printer print',
    '🖱️|computer mouse|computer_mouse',
    '💽|computer disk|computer_disk',
    '💾|floppy disk|floppy_disk save',
    '💿|optical disk|cd disk',
    '📀|dvd|dvd',
    '🧮|abacus|abacus calculate',
    '🎥|movie camera|movie_camera film',
    '📷|camera|camera photo',
    '📸|camera with flash|camera_flash screenshot',
    '📹|video camera|video_camera record',
    '📼|videocassette|vhs',
    '🔍|magnifying glass tilted left|search magnify find inspect',
    '🔎|magnifying glass tilted right|search_right zoom',
    '🕯️|candle|candle',
    '💡|light bulb|bulb idea insight',
    '🔦|flashlight|flashlight torch',
    '🏮|red paper lantern|lantern',
    '📔|notebook with decorative cover|notebook_with_cover',
    '📕|closed book|closed_book',
    '📖|open book|book read docs',
    '📗|green book|green_book',
    '📘|blue book|blue_book',
    '📙|orange book|orange_book',
    '📚|books|books library docs learning',
    '📓|notebook|notebook notes',
    '📒|ledger|ledger accounts',
    '📃|page with curl|page_with_curl',
    '📜|scroll|scroll licence',
    '📄|page facing up|page_facing_up document file',
    '📰|newspaper|newspaper news',
    '🗞️|rolled up newspaper|rolled_newspaper',
    '📑|bookmark tabs|bookmark_tabs',
    '🔖|bookmark|bookmark save',
    '🏷️|label|label tag',
    '💰|money bag|moneybag revenue',
    '🪙|coin|coin',
    '💴|yen banknote|yen',
    '💵|dollar banknote|dollar money cash',
    '💶|euro banknote|euro',
    '💷|pound banknote|pound',
    '💸|money with wings|money_with_wings spend cost burn',
    '💳|credit card|credit_card payment billing',
    '🧾|receipt|receipt invoice expense',
    '💹|chart increasing with yen|chart_yen',
    '✉️|envelope|envelope email mail',
    '📧|e mail|email inbox',
    '📨|incoming envelope|incoming_envelope',
    '📩|envelope with arrow|envelope_with_arrow send',
    '📤|outbox tray|outbox sent',
    '📥|inbox tray|inbox received',
    '📦|package|package shipping box release',
    '📫|closed mailbox with raised flag|mailbox',
    '📮|postbox|postbox',
    '🗳️|ballot box with ballot|ballot_box vote',
    '✏️|pencil|pencil write edit',
    '✒️|black nib|black_nib sign',
    '🖋️|fountain pen|fountain_pen',
    '🖊️|pen|pen',
    '🖌️|paintbrush|paintbrush',
    '🖍️|crayon|crayon',
    '📝|memo|memo note write draft',
    '💼|briefcase|briefcase work business',
    '📁|file folder|file_folder folder',
    '📂|open file folder|open_file_folder',
    '🗂️|card index dividers|card_index_dividers organise',
    '📅|calendar|calendar date',
    '📆|tear off calendar|calendar_tear schedule',
    '🗒️|spiral notepad|spiral_notepad',
    '🗓️|spiral calendar|spiral_calendar planning',
    '📇|card index|card_index contacts',
    '📈|chart increasing|chart_increasing growth up metrics revenue',
    '📉|chart decreasing|chart_decreasing down decline',
    '📊|bar chart|bar_chart analytics report dashboard',
    '📋|clipboard|clipboard tasks copy checklist',
    '📌|pushpin|pushpin pin',
    '📍|round pushpin|round_pushpin location',
    '📎|paperclip|paperclip attach attachment',
    '🖇️|linked paperclips|linked_paperclips',
    '📏|straight ruler|straight_ruler measure',
    '📐|triangular ruler|triangular_ruler',
    '✂️|scissors|scissors cut',
    '🗃️|card file box|card_file_box archive',
    '🗄️|file cabinet|file_cabinet records',
    '🗑️|wastebasket|wastebasket delete trash',
    '🔒|locked|lock secure private',
    '🔓|unlocked|unlock open public',
    '🔏|locked with pen|locked_with_pen',
    '🔐|locked with key|closed_lock_with_key encrypted',
    '🔑|key|key access credential',
    '🗝️|old key|old_key',
    '🔨|hammer|hammer build fix',
    '🪓|axe|axe',
    '⛏️|pick|pick mine',
    '⚒️|hammer and pick|hammer_and_pick',
    '🛠️|hammer and wrench|tools maintenance build',
    '🗡️|dagger|dagger',
    '🔫|water pistol|water_pistol',
    '🪃|boomerang|boomerang',
    '🛡️|shield|shield security defend',
    '🔧|wrench|wrench fix config',
    '🪛|screwdriver|screwdriver',
    '🔩|nut and bolt|nut_and_bolt',
    '⚙️|gear|gear settings config cog',
    '🗜️|clamp|clamp compress',
    '⚖️|balance scale|balance_scale legal fair compare',
    '🦯|white cane|white_cane accessibility',
    '🔗|link|link url reference',
    '⛓️|chains|chains',
    '🧰|toolbox|toolbox',
    '🧲|magnet|magnet attract',
    '🪜|ladder|ladder',
    '🧪|test tube|test_tube experiment',
    '🧫|petri dish|petri_dish',
    '🧬|dna|dna genetics',
    '🔬|microscope|microscope research detail',
    '🔭|telescope|telescope vision far',
    '📡|satellite antenna|satellite signal',
    '💉|syringe|syringe vaccine',
    '🩹|adhesive bandage|adhesive_bandage patch fix',
    '🩺|stethoscope|stethoscope health check',
    '🚪|door|door',
    '🪟|window|window',
    '🛏️|bed|bed sleep',
    '🛋️|couch and lamp|couch lounge',
    '🪑|chair|chair',
    '🚽|toilet|toilet',
    '🚿|shower|shower',
    '🛁|bathtub|bathtub',
    '🧴|lotion bottle|lotion_bottle',
    '🧷|safety pin|safety_pin',
    '🧹|broom|broom clean sweep cleanup',
    '🧺|basket|basket',
    '🧻|roll of paper|roll_of_paper',
    '🧼|soap|soap wash',
    '🪥|toothbrush|toothbrush',
    '🔔|bell|bell notification alert',
    '🔕|bell with slash|no_bell mute silence',
    '📢|loudspeaker|loudspeaker announce',
    '📣|megaphone|megaphone shout marketing',
    '📯|postal horn|postal_horn',
    '🔊|speaker high volume|loud_sound volume',
    '🔇|muted speaker|mute',
    '⏰|alarm clock|alarm_clock reminder',
    '⏱️|stopwatch|stopwatch timing performance',
    '⏲️|timer clock|timer',
    '🕰️|mantelpiece clock|mantelpiece_clock',
    '⌛|hourglass done|hourglass waiting',
    '⏳|hourglass not done|hourglass_flowing pending',
    '🔋|battery|battery power',
    '🪫|low battery|low_battery',
    '🔌|electric plug|electric_plug power',
    '🧯|fire extinguisher|fire_extinguisher incident',
    '🛢️|oil drum|oil_drum',
    '🎛️|control knobs|control_knobs',
    '🎚️|level slider|level_slider',
    '📻|radio|radio',
    '☎️|telephone|telephone call',
    '📞|telephone receiver|telephone_receiver call',
    '📟|pager|pager oncall',
    '📠|fax machine|fax',
    '🔮|crystal ball|crystal_ball forecast predict',
    '🧿|nazar amulet|nazar_amulet',
    '🪬|hamsa|hamsa',
    '🩸|drop of blood|drop_of_blood',
    '💊|pill|pill medicine',
    '🚬|cigarette|cigarette',
    '⚰️|coffin|coffin',
    '🪦|headstone|headstone',
    '👑|crown|crown king best',
    '👓|glasses|eyeglasses',
    '🕶️|sunglasses|dark_sunglasses',
    '🥼|lab coat|lab_coat',
    '🦺|safety vest|safety_vest',
    '👔|necktie|necktie',
    '👕|t shirt|shirt tshirt',
    '👖|jeans|jeans',
    '🧥|coat|coat',
    '👗|dress|dress',
    '👜|handbag|handbag',
    '🎒|backpack|backpack school',
    '👞|man s shoe|mans_shoe',
    '👟|running shoe|athletic_shoe sneaker',
    '🥾|hiking boot|hiking_boot',
    '👠|high heeled shoe|high_heel',
    '🧢|billed cap|billed_cap',
    '⛑️|rescue worker s helmet|rescue_worker_helmet safety',
    '💄|lipstick|lipstick',
    '💍|ring|ring engagement',
    '💎|gem stone|gem diamond premium value',
  ],
  symbols: [
    '❤️|red heart|heart love like',
    '🧡|orange heart|orange_heart',
    '💛|yellow heart|yellow_heart',
    '💚|green heart|green_heart',
    '💙|blue heart|blue_heart',
    '💜|purple heart|purple_heart',
    '🖤|black heart|black_heart',
    '🤍|white heart|white_heart',
    '🤎|brown heart|brown_heart',
    '💔|broken heart|broken_heart',
    '❣️|heart exclamation|heart_exclamation',
    '💕|two hearts|two_hearts',
    '💞|revolving hearts|revolving_hearts',
    '💓|beating heart|heartbeat',
    '💗|growing heart|heartpulse',
    '💖|sparkling heart|sparkling_heart',
    '💘|heart with arrow|cupid',
    '💝|heart with ribbon|gift_heart',
    '💟|heart decoration|heart_decoration',
    '☮️|peace symbol|peace_symbol',
    '✝️|latin cross|latin_cross',
    '☪️|star and crescent|star_and_crescent',
    '🕉️|om|om',
    '✡️|star of david|star_of_david',
    '☸️|wheel of dharma|wheel_of_dharma',
    '☯️|yin yang|yin_yang balance',
    '♈|aries|aries',
    '♉|taurus|taurus',
    '♊|gemini|gemini',
    '♋|cancer|cancer',
    '♌|leo|leo',
    '♍|virgo|virgo',
    '♎|libra|libra',
    '♏|scorpio|scorpio',
    '♐|sagittarius|sagittarius',
    '♑|capricorn|capricorn',
    '♒|aquarius|aquarius',
    '♓|pisces|pisces',
    '🆔|id button|id identifier',
    '⚛️|atom symbol|atom_symbol science react',
    '🉑|japanese acceptable button|accept',
    '☢️|radioactive|radioactive',
    '☣️|biohazard|biohazard',
    '📴|mobile phone off|mobile_phone_off',
    '📳|vibration mode|vibration_mode',
    '🈶|japanese not free of charge button|u6709',
    '🈚|japanese free of charge button|u7121',
    '🈸|japanese application button|u7533',
    '✴️|eight pointed star|eight_pointed_black_star',
    '🆚|vs button|vs versus',
    '💮|white flower|white_flower',
    '🉐|japanese bargain button|ideograph_advantage',
    '㊙️|japanese secret button|secret',
    '🈺|japanese open for business button|u55b6',
    '🈵|japanese no vacancy button|u6e80',
    '🔴|red circle|red_circle',
    '🟠|orange circle|orange_circle',
    '🟡|yellow circle|yellow_circle',
    '🟢|green circle|green_circle',
    '🔵|blue circle|blue_circle',
    '🟣|purple circle|purple_circle',
    '🟤|brown circle|brown_circle',
    '⚫|black circle|black_circle',
    '⚪|white circle|white_circle',
    '🟥|red square|red_square',
    '🟧|orange square|orange_square',
    '🟨|yellow square|yellow_square',
    '🟩|green square|green_square',
    '🟦|blue square|blue_square',
    '🟪|purple square|purple_square',
    '🟫|brown square|brown_square',
    '⬛|black large square|black_large_square',
    '⬜|white large square|white_large_square',
    '🔶|large orange diamond|large_orange_diamond',
    '🔷|large blue diamond|large_blue_diamond',
    '🔸|small orange diamond|small_orange_diamond',
    '🔹|small blue diamond|small_blue_diamond',
    '🔺|red triangle pointed up|small_red_triangle',
    '🔻|red triangle pointed down|small_red_triangle_down',
    '💠|diamond with a dot|diamond_shape_with_a_dot_inside',
    '🔘|radio button|radio_button',
    '🔳|white square button|white_square_button',
    '🔲|black square button|black_square_button',
    '⭕|hollow red circle|o circle',
    '❌|cross mark|x no wrong fail',
    '❎|cross mark button|negative_squared_cross_mark',
    '✅|check mark button|white_check_mark done complete pass yes',
    '☑️|check box with check|ballot_box_with_check checked',
    '✔️|check mark|heavy_check_mark tick done',
    '➕|plus|heavy_plus_sign add',
    '➖|minus|heavy_minus_sign remove',
    '➗|divide|heavy_division_sign',
    '✖️|multiply|heavy_multiplication_x',
    '💯|hundred points|100 perfect score agreed',
    '🔥|fire|fire_symbol',
    '‼️|double exclamation mark|bangbang urgent',
    '⁉️|exclamation question mark|interrobang',
    '❓|red question mark|question help',
    '❔|white question mark|grey_question',
    '❗|red exclamation mark|exclamation important',
    '❕|white exclamation mark|grey_exclamation',
    '〰️|wavy dash|wavy_dash',
    '©️|copyright|copyright',
    '®️|registered|registered',
    '™️|trade mark|tm trademark',
    '#️⃣|keycap hash|hash channel',
    '*️⃣|keycap asterisk|asterisk',
    '0️⃣|keycap 0|zero',
    '1️⃣|keycap 1|one first',
    '2️⃣|keycap 2|two second',
    '3️⃣|keycap 3|three third',
    '4️⃣|keycap 4|four',
    '5️⃣|keycap 5|five',
    '6️⃣|keycap 6|six',
    '7️⃣|keycap 7|seven',
    '8️⃣|keycap 8|eight',
    '9️⃣|keycap 9|nine',
    '🔟|keycap 10|keycap_ten ten',
    '🔠|input latin uppercase|capital_abcd',
    '🔡|input latin lowercase|abcd',
    '🔢|input numbers|1234 numbers',
    '🔣|input symbols|symbols',
    '🔤|input latin letters|abc',
    '🅰️|a button|a_button',
    '🆎|ab button|ab_button',
    '🅱️|b button|b_button',
    '🆑|cl button|cl_button',
    '🆒|cool button|cool',
    '🆓|free button|free',
    'ℹ️|information|information_source info',
    '🆕|new button|new',
    '🆖|ng button|ng',
    '🅾️|o button|o_button',
    '🆗|ok button|ok_button',
    '🅿️|p button|parking',
    '🆘|sos button|sos help emergency',
    '🆙|up button|up',
    '🆙|up|up_arrow_button',
    '🔝|top arrow|top',
    '🔚|end arrow|end',
    '🔙|back arrow|back',
    '🔛|on arrow|on',
    '🔜|soon arrow|soon',
    '➡️|right arrow|arrow_right next',
    '⬅️|left arrow|arrow_left previous',
    '⬆️|up arrow|arrow_up',
    '⬇️|down arrow|arrow_down',
    '↗️|up right arrow|arrow_upper_right',
    '↘️|down right arrow|arrow_lower_right',
    '↙️|down left arrow|arrow_lower_left',
    '↖️|up left arrow|arrow_upper_left',
    '↕️|up down arrow|arrow_up_down',
    '↔️|left right arrow|left_right_arrow',
    '↩️|right arrow curving left|leftwards_arrow_with_hook reply',
    '↪️|left arrow curving right|arrow_right_hook forward',
    '🔀|shuffle tracks button|twisted_rightwards_arrows shuffle',
    '🔁|repeat button|repeat loop',
    '🔂|repeat single button|repeat_one',
    '🔄|counterclockwise arrows button|arrows_counterclockwise refresh sync retry',
    '🔃|clockwise vertical arrows|arrows_clockwise reload',
    '▶️|play button|arrow_forward play',
    '⏸️|pause button|pause_button hold',
    '⏹️|stop button|stop_button',
    '⏺️|record button|record_button',
    '⏭️|next track button|next_track skip',
    '⏮️|last track button|previous_track',
    '⏩|fast forward button|fast_forward',
    '⏪|fast reverse button|rewind',
    '🔼|upwards button|arrow_up_small',
    '🔽|downwards button|arrow_down_small',
    '⏏️|eject button|eject_button',
    '🎦|cinema|cinema',
    '🔅|dim button|low_brightness',
    '🔆|bright button|high_brightness',
    '📶|antenna bars|signal_strength',
    '📵|no mobile phones|no_mobile_phones',
    '🚫|prohibited|no_entry_sign blocked forbidden',
    '⛔|no entry|no_entry stop',
    '♻️|recycling symbol|recycle',
    '⚜️|fleur de lis|fleur_de_lis',
    '🔱|trident emblem|trident',
    '📛|name badge|name_badge',
    '⚠️|warning|warning caution risk',
    '🚸|children crossing|children_crossing',
    '💤|zzz|zzz sleep idle',
    '💬|speech balloon|speech_balloon comment message chat',
    '🗨️|left speech bubble|left_speech_bubble',
    '🗯️|right anger bubble|anger_bubble',
    '💭|thought balloon|thought_balloon idea',
    '👁️‍🗨️|eye in speech bubble|eye_in_speech_bubble',
    '🔟|ten|ten_symbol',
    '🕐|one o clock|clock1 time',
    '🕒|three o clock|clock3',
    '🕕|six o clock|clock6',
    '🕘|nine o clock|clock9',
    '🈯|japanese reserved button|u6307',
  ],
  flags: [
    '🏁|chequered flag|checkered_flag finish race done',
    '🚩|triangular flag|triangular_flag flagged',
    '🎌|crossed flags|crossed_flags',
    '🏴|black flag|black_flag',
    '🏳️|white flag|white_flag surrender',
    '🏳️‍🌈|rainbow flag|rainbow_flag pride',
    '🏳️‍⚧️|transgender flag|transgender_flag',
    '🏴‍☠️|pirate flag|pirate_flag',
    '🇿🇼|flag zimbabwe|zimbabwe zw',
    '🇿🇦|flag south africa|south_africa za',
    '🇰🇪|flag kenya|kenya ke',
    '🇳🇬|flag nigeria|nigeria ng',
    '🇬🇭|flag ghana|ghana gh',
    '🇪🇬|flag egypt|egypt eg',
    '🇲🇦|flag morocco|morocco ma',
    '🇧🇼|flag botswana|botswana bw',
    '🇿🇲|flag zambia|zambia zm',
    '🇲🇿|flag mozambique|mozambique mz',
    '🇹🇿|flag tanzania|tanzania tz',
    '🇺🇬|flag uganda|uganda ug',
    '🇷🇼|flag rwanda|rwanda rw',
    '🇪🇹|flag ethiopia|ethiopia et',
    '🇺🇸|flag united states|us usa united_states america',
    '🇬🇧|flag united kingdom|gb uk united_kingdom britain',
    '🇨🇦|flag canada|canada ca',
    '🇲🇽|flag mexico|mexico mx',
    '🇧🇷|flag brazil|brazil br',
    '🇦🇷|flag argentina|argentina ar',
    '🇨🇱|flag chile|chile cl',
    '🇨🇴|flag colombia|colombia co',
    '🇩🇪|flag germany|germany de',
    '🇫🇷|flag france|france fr',
    '🇪🇸|flag spain|spain es',
    '🇵🇹|flag portugal|portugal pt',
    '🇮🇹|flag italy|italy it',
    '🇳🇱|flag netherlands|netherlands nl',
    '🇧🇪|flag belgium|belgium be',
    '🇨🇭|flag switzerland|switzerland ch',
    '🇦🇹|flag austria|austria at',
    '🇸🇪|flag sweden|sweden se',
    '🇳🇴|flag norway|norway no',
    '🇩🇰|flag denmark|denmark dk',
    '🇫🇮|flag finland|finland fi',
    '🇮🇪|flag ireland|ireland ie',
    '🇵🇱|flag poland|poland pl',
    '🇺🇦|flag ukraine|ukraine ua',
    '🇷🇺|flag russia|russia ru',
    '🇹🇷|flag turkey|turkey tr',
    '🇬🇷|flag greece|greece gr',
    '🇮🇱|flag israel|israel il',
    '🇦🇪|flag united arab emirates|uae united_arab_emirates ae',
    '🇸🇦|flag saudi arabia|saudi_arabia sa',
    '🇮🇳|flag india|india in',
    '🇵🇰|flag pakistan|pakistan pk',
    '🇧🇩|flag bangladesh|bangladesh bd',
    '🇨🇳|flag china|china cn',
    '🇯🇵|flag japan|japan jp',
    '🇰🇷|flag south korea|south_korea kr',
    '🇹🇼|flag taiwan|taiwan tw',
    '🇭🇰|flag hong kong|hong_kong hk',
    '🇸🇬|flag singapore|singapore sg',
    '🇲🇾|flag malaysia|malaysia my',
    '🇮🇩|flag indonesia|indonesia id',
    '🇹🇭|flag thailand|thailand th',
    '🇻🇳|flag vietnam|vietnam vn',
    '🇵🇭|flag philippines|philippines ph',
    '🇦🇺|flag australia|australia au',
    '🇳🇿|flag new zealand|new_zealand nz',
    '🇪🇺|flag european union|european_union eu',
  ],
};

// ── Parsed set ────────────────────────────────────────────────

export interface EmojiEntry {
  /** The base glyph, without any skin-tone modifier applied. */
  char: string;
  /** Canonical sentence-case-ish label, e.g. "thumbs up". */
  name: string;
  /** Canonical `:shortcode:` body, e.g. `thumbs_up`. */
  shortcode: string;
  /** Search aliases. The first is also registered as a short alias. */
  keywords: readonly string[];
  category: Exclude<EmojiCategoryId, 'recent'>;
  /** Whether the glyph accepts a Fitzpatrick skin-tone modifier. */
  tone: boolean;
}

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function parse(): EmojiEntry[] {
  const out: EmojiEntry[] = [];
  const seen = new Set<string>();
  for (const [category, rows] of Object.entries(RAW) as [
    Exclude<EmojiCategoryId, 'recent'>,
    string[],
  ][]) {
    for (const row of rows) {
      const tone = row.startsWith('+');
      const [char, name, keywordBlob] = (tone ? row.slice(1) : row).split('|');
      if (!char || !name) continue;
      // A glyph can legitimately appear in two categories (🙈 is both a
      // smiley and an animal). Keep the first listing so the picker never
      // shows a duplicate.
      if (seen.has(char)) continue;
      seen.add(char);
      out.push({
        char,
        name,
        shortcode: slug(name),
        keywords: keywordBlob ? keywordBlob.split(/\s+/).filter(Boolean) : [],
        category,
        tone,
      });
    }
  }
  return out;
}

/** The full curated set, in category order. */
export const EMOJI: readonly EmojiEntry[] = parse();

const BY_CHAR = new Map<string, EmojiEntry>(EMOJI.map((e) => [e.char, e]));

/**
 * shortcode → entry. Canonical shortcodes are registered first, then each
 * entry's leading keyword as an alias. First writer wins, so a canonical name
 * can never be shadowed by another entry's alias.
 */
const BY_CODE = (() => {
  const map = new Map<string, EmojiEntry>();
  for (const e of EMOJI) map.set(e.shortcode, e);
  for (const e of EMOJI) {
    const alias = e.keywords[0];
    if (alias && !map.has(alias)) map.set(alias, e);
  }
  return map;
})();

/** Look up an entry by its exact glyph (tone modifiers stripped first). */
export function emojiFromChar(char: string): EmojiEntry | undefined {
  return BY_CHAR.get(char) ?? BY_CHAR.get(stripSkinTone(char));
}

/** Look up an entry by shortcode. Accepts `thumbs_up` or `:thumbs_up:`. */
export function emojiByShortcode(code: string): EmojiEntry | undefined {
  return BY_CODE.get(code.replace(/^:|:$/g, '').toLowerCase());
}

/** Every registered shortcode and alias, sorted. Handy for autocomplete. */
export function emojiShortcodes(): string[] {
  return [...BY_CODE.keys()].sort();
}

// ── Skin tone ─────────────────────────────────────────────────

const TONE_MODIFIER_RE = /[\u{1F3FB}-\u{1F3FF}]/gu;

/** Remove any Fitzpatrick modifier from a glyph. */
export function stripSkinTone(char: string): string {
  return char.replace(TONE_MODIFIER_RE, '');
}

/**
 * Apply a skin tone to a glyph.
 *
 * The modifier goes immediately after the first codepoint, which is where it
 * belongs for both plain glyphs (👋 → 👋🏽) and ZWJ sequences (🧑‍💻 →
 * 🧑🏽‍💻). Glyphs that don't accept a tone are returned unchanged.
 */
export function applySkinTone(char: string, tone: SkinToneId | SkinTone = 'default'): string {
  const resolved = typeof tone === 'string' ? TONE_BY_ID.get(tone) : tone;
  const base = stripSkinTone(char);
  if (!resolved || !resolved.modifier) return base;
  const entry = BY_CHAR.get(base);
  if (entry && !entry.tone) return base;
  const points = [...base];
  if (points.length === 0) return base;
  return points[0]! + resolved.modifier + points.slice(1).join('');
}

// ── Search ────────────────────────────────────────────────────

export interface SearchEmojiOptions {
  /** Cap the result count. @default 96 */
  limit?: number;
  /** Restrict to one category. */
  category?: Exclude<EmojiCategoryId, 'recent'>;
  /** Search this set instead of the bundled one. */
  emoji?: readonly EmojiEntry[];
}

/**
 * Rank-ordered emoji search over names and keywords.
 *
 * Ranking, best first: exact shortcode or alias · name/keyword prefix ·
 * word-boundary prefix inside the name · substring anywhere. Ties break on the
 * entry's position in the set, which keeps the common faces above the obscure
 * ones for a query like "sm".
 *
 * An empty query returns the (optionally category-filtered) set unchanged, so
 * the picker can use one code path for browsing and searching.
 */
export function searchEmoji(query: string, options: SearchEmojiOptions = {}): EmojiEntry[] {
  const { limit = 96, category, emoji = EMOJI } = options;
  const pool = category ? emoji.filter((e) => e.category === category) : emoji;
  const q = query.trim().toLowerCase().replace(/^:|:$/g, '');
  if (!q) return pool.slice(0, limit);

  // A query that is itself an emoji: match the glyph directly.
  const direct = emojiFromChar(query.trim());
  if (direct) return [direct];

  const scored: { entry: EmojiEntry; score: number; index: number }[] = [];

  pool.forEach((entry, index) => {
    let best = 0;
    const haystacks = [entry.shortcode, entry.name, ...entry.keywords];
    for (const raw of haystacks) {
      const h = raw.toLowerCase();
      if (h === q) {
        best = Math.max(best, 100);
        continue;
      }
      if (h.startsWith(q)) {
        best = Math.max(best, 70);
        continue;
      }
      // Word-boundary prefix: "waving hand" should match "hand".
      if (h.includes(` ${q}`) || h.includes(`_${q}`)) {
        best = Math.max(best, 45);
        continue;
      }
      if (h.includes(q)) best = Math.max(best, 20);
    }
    if (best > 0) scored.push({ entry, score: best, index });
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, limit).map((s) => s.entry);
}

// ── Text tokenizing ───────────────────────────────────────────

/**
 * Matches, in order: a `:shortcode:`, a regional-indicator flag pair, or a
 * pictographic cluster (base + optional modifier/VS16/keycap, plus any ZWJ
 * continuations). The flag branch has to precede the general branch because
 * regional indicators are pictographic individually but only meaningful in
 * pairs.
 *
 * Built fresh per call rather than shared: a `g`-flagged regex carries
 * `lastIndex`, and a module-level instance would make `tokenizeEmojiText`
 * non-reentrant.
 */
function emojiRegex(): RegExp {
  return new RegExp(
    [
      ':([a-z0-9_+-]{1,40}):',
      '[\\u{1F1E6}-\\u{1F1FF}]{2}',
      '\\p{Extended_Pictographic}(?:\\uFE0F|\\u{1F3FB}-\\u{1F3FF}|\\u20E3)?' +
        '(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|[\\u{1F3FB}-\\u{1F3FF}])?)*',
      '[0-9#*]\\uFE0F?\\u20E3',
    ].join('|'),
    'gu',
  );
}

export type EmojiToken =
  | { type: 'text'; value: string }
  | {
      type: 'emoji';
      /** The glyph to render. */
      value: string;
      /** The matched entry, when the glyph is in the set. */
      entry?: EmojiEntry;
      /** Set when the source was a `:shortcode:` rather than a literal glyph. */
      shortcode?: string;
    };

export interface TokenizeEmojiOptions {
  /** Resolve `:shortcode:` sequences to glyphs. @default true */
  shortcodes?: boolean;
  /** Skin tone applied to shortcode-resolved glyphs. @default 'default' */
  tone?: SkinToneId;
}

/**
 * Split text into alternating text and emoji tokens.
 *
 * Unrecognised `:words:` are left as plain text — colons are common in prose
 * ("note: see below"), and silently eating them would be worse than not
 * expanding a typo'd shortcode.
 */
export function tokenizeEmojiText(
  text: string,
  options: TokenizeEmojiOptions = {},
): EmojiToken[] {
  const { shortcodes = true, tone = 'default' } = options;
  const tokens: EmojiToken[] = [];
  if (!text) return tokens;

  const re = emojiRegex();
  let cursor = 0;
  let match: RegExpExecArray | null;

  const pushText = (value: string) => {
    if (!value) return;
    const last = tokens[tokens.length - 1];
    if (last?.type === 'text') last.value += value;
    else tokens.push({ type: 'text', value });
  };

  while ((match = re.exec(text)) !== null) {
    const [raw, code] = match;

    if (code !== undefined) {
      const entry = shortcodes ? emojiByShortcode(code) : undefined;
      if (!entry) {
        pushText(text.slice(cursor, match.index) + raw);
        cursor = match.index + raw.length;
        continue;
      }
      pushText(text.slice(cursor, match.index));
      tokens.push({
        type: 'emoji',
        value: applySkinTone(entry.char, tone),
        entry,
        shortcode: code,
      });
      cursor = match.index + raw.length;
      continue;
    }

    pushText(text.slice(cursor, match.index));
    tokens.push({ type: 'emoji', value: raw, entry: emojiFromChar(raw) });
    cursor = match.index + raw.length;
  }

  pushText(text.slice(cursor));
  return tokens;
}

/** How many emoji the text contains (after shortcode expansion). */
export function countEmoji(text: string, options?: TokenizeEmojiOptions): number {
  return tokenizeEmojiText(text, options).filter((t) => t.type === 'emoji').length;
}

/**
 * True when the text is nothing but emoji and whitespace. Drives the jumbo
 * rendering in the conversation view — a message of pure emoji is a gesture,
 * and gestures should be big.
 */
export function isEmojiOnly(text: string, options?: TokenizeEmojiOptions): boolean {
  const tokens = tokenizeEmojiText(text, options);
  if (tokens.length === 0) return false;
  let sawEmoji = false;
  for (const t of tokens) {
    if (t.type === 'emoji') sawEmoji = true;
    else if (t.value.trim() !== '') return false;
  }
  return sawEmoji;
}

/** Replace every `:shortcode:` in the text with its glyph. */
export function replaceShortcodes(text: string, tone: SkinToneId = 'default'): string {
  return tokenizeEmojiText(text, { tone })
    .map((t) => t.value)
    .join('');
}
