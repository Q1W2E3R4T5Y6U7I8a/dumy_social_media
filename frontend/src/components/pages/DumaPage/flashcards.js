export const flashcards = [
    {
      id: 1,
      image: '/air_icon.png',
      question: "You feel the light of existence. Do you want to grasp it?\n\n\n*Swipe left/right",
      effects: {
        yes: { air: 49, fire: 0, water: 0, earth: 0, time: 0, timeLabel: "Time before existence" },
        no: { air: -100, fire: 0, water: 0, earth: 0, time: 0, timeLabel: "Time before existence" }
      },
      description: { yes: "Yes", no: "No" },
      color: { yes: 'white', no: 'black' }
    },
    {
      id: 2,
      image: '/fire_icon.png',
      question: "Though r u sure?!",
      effects: {
        yes: { air: 0, fire: 49, water: 0, earth: 0, time: 0, timeLabel: "Time before existence" },
        no: { air: 0, fire: -100, water: 0, earth: 0, time: 0, timeLabel: "Time before existence" }
      },
      description: { yes: "Yes!", no: "Nope" },
      color: { yes: 'red', no: 'black' }
    },
    {
      id: 3,
      image: '/earth_icon.png',
      question: "Though it's going to be tough. Do you WANT that? ",
      effects: {
        yes: { air: 0, fire: 0, water: 0, earth: 49, time: 0, timeLabel: "Time before existence" },
        no: { air: 0, fire: 0, water: 0, earth: -100, time: 0, timeLabel: "Time before existence" }
      },
      description: { yes: "I will handle that. I want it", no: "Naaaah" },
      color: { yes: 'green', no: 'black' }
    },
    {
      id: 4,
      image: '/water_icon.png',
      question: "R u ready to accept chaos and constant changes?",
      effects: {
        yes: { air: 0, fire: 0, water: 49, earth: 0, time: 0, timeLabel: "Time before existence" },
        no: { air: 0, fire: 0, water: -100, earth: 0, time: 0, timeLabel: "Time before existence" }
      },
      description: { yes: "Let the flow guide me, though I know nothing, I will be moving", no: "Naaaaah" },
      color: { yes: 'blue', no: 'black' }
    },
    {
      id: 5,
      image: '/universia.png',
      question: "Hi. I am Universia, who tf r u? Ohhhh, u r that one!? Ha, didn't think that I wd see smb like you! \n Hope u don't mind that u r dead? \n \n We are at the time before BigBang, before creation, so technically u r not even dead, to be dead u had to die, and to die u had to be alive before which is not about u. Maybe u wd rather not exist with me and stay here more, maybe forever, or do u wanna start? ",
      effects: {
        yes: { air: 10, fire: 10, water: 10, earth: 10, time: 0, timeLabel: "Time before existence" },
        no: { air: -10, fire: -10, water: -10, earth: -10, time: 0, timeLabel: "Time before existence" }
      },
      description: { yes: "I am ready to go!", no: "Naaaah, I'd rather stay in emptiness" },
      color: { yes: 'white', no: 'black' }
    },
    {
      id: 6,
      image: '/universia.png',
      question: "Interesting though dunno why I even ask, as I know, your species can't really influence something. Ha! Loooooser! Same as in your mortal life. Though it's fun to have a company. Swipe left, swipe right, it doesn't matter, u r literally a quantum that created the world around you because it was for eternity in itself. Red or green swipe u choose, doesn't matter. Because u already did. Billions time already",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "Time before existence" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "Time before existence" }
      },
      description: { yes: "Oh... Okay", no: "Oh... Okay" },
      color: { yes: 'blue', no: 'blue' }
    },
    {
      id: 7,
      image: '/universia.png',
      question: "Let there be light!",
      effects: {
        yes: { air: 5, fire: 5, earth: -5, water: 0, time: 1, timeLabel: "Day" },
        no: { air: -5, fire: -5, earth: 5, water: 0, time: 1, timeLabel: "Day" }
      },
      description: { yes: "Even lighter!", no: "Though, not so bright, please?" },
      color: { yes: 'white', no: 'black' }
    },
    {
      id: 8,
      image: '/universia.png',
      question: "Now! Sky above, water below. Separation. The first bureaucracy.",
      effects: {
        yes: { air: -5, fire: 0, earth: 5, water: -5, time: 1, timeLabel: "Day" },
        no: { air: 5, fire: 0, earth: -5, water: 5, time: 1, timeLabel: "Day" }
      },
      description: { yes: "Hell yea!", no: "Universia, though make more chaos please, let there be fuck*ng giant black holes and sh*t" },
      color: { yes: 'white', no: 'purple' }
    },
    {
      id: 9,
      image: '/universia.png',
      question: "Land rose. Plants sprouted. Pretty. Temporary. Gentle.",
      effects: {
        yes: { air: 0, fire: 15, earth: 10, water: 10, time: 1, timeLabel: "Day" },
        no: { air: 0, fire: 0, earth: -10, water: -10, time: 1, timeLabel: "Day" }
      },
      description: { yes: "Wow! Make even more greenery, I like it!", no: "Can u add more vulcanos please? I really wanna test something ^^" },
      color: { yes: '#00FF00', no: '#FF0000' }
    },
    {
      id: 10,
      image: '/universia.png',
      question: "Sun and moon installed",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 1, timeLabel: "Day" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 1, timeLabel: "Day" }
      },
      description: { yes: "Though there already was light? why wd u? okay, nevermind. God works in misterious ways", no: "Though there already was light? why wd u? okay, nevermind. God works in misterious ways" },
      color: { yes: 'blue', no: 'blue' }
    },
    {
      id: 11,
      image: '/universia.png',
      question: "Birds soared. Fish swam. None of them knew why, and that was fine.",
      effects: {
        yes: { air: 0, fire: 0, earth: -10, water: -10, time: 1, timeLabel: "Day" },
        no: { air: 0, fire: 0, earth: 10, water: 10, time: 1, timeLabel: "Day" }
      },
      description: { yes: "I wanna even more breeds! Sky bisons, flying lemurs, dragons, turtle ducks, all of it!", no: "Nice, though add no more, with evolution they will come into best forms" },
      color: { yes: 'green', no: 'black' }
    },
    {
      id: 12,
      image: '/universia.png',
      question: "Let's make something that knows it will die. And so, humans.",
      effects: {
        yes: { air: 15, fire: 15, earth: -15, water: -15, time: 1, timeLabel: "Day" },
        no: { air: 5, fire: 5, earth: -5, water: -5, time: 1, timeLabel: "Day" }
      },
      description: { yes: "Great idea! Make lot's of them!", no: "Okay, though let's start with few, okay? I suspicious" },
      color: { yes: 'orange', no: 'yellow' }
    },
    {
      id: 13,
      image: '/universia.png',
      question: "O lala! Pretty good it is, what u think? I am so good at this, right? Now I deserved some rest...",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 1, timeLabel: "Day" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 1, timeLabel: "Day" }
      },
      description: { yes: "I guess. It's a good world you made, Universia.", no: "I guess. It's a good world you made, Universia." },
      color: { yes: 'white', no: 'white' }
    },
    {
      id: 14,
      image: '/universia.png',
      question: "Ohhh peaple are so cute, they are calling us! Hope they didn't eat the apple that I keep for for my pal Paul.",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "Day" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "Day" }
      },
      description: { yes: "Of course not, human are consious beings, pretty sure they wonna tell us how much they love us", no: "Don't take your hopes high" },
      color: { yes: 'green', no: 'red' }
    },
    {
      id: 15,
      image: '/adam_eve.png',
      question: "I ate forbidden apple because of the woman! - Adam said - It's her fault. And, actually, kinda yours too! Please, don't punish us, okay?",
      effects: {
        yes: { air: -10, fire: -100, earth: 0, water: 0, time: 499993, timeLabel: "Years, before civilization" },
        no: { air: 10, fire: 10, earth: -10, water: -10, time: 499993, timeLabel: "Years, before civilization" }
      },
      description: { yes: "Spare them, let life be as it is, everything is balanced, even though they want to escape this paradise matrix. Keep them against their will", no: "We have to punish them if we want to keep consiousness, they wanna become Gods, I guess, that's cute though they have a long way to go I guess" },
      color: { yes: 'green', no: 'red' }
    },
    {
      id: 16,
      image: '/adam_eve.png',
      question: "Humans discovered fire! Only 50 thousands years ago before the DUMA was created! Didn't expect that. Do you think we should scare caveman and let them become homo sapiens or rather keep them bended with nature and let them become elves?",
      effects: {
        yes: { air: 10, fire: 10, earth: -10, water: -10, time: 0, timeLabel: "Years, before civilization" },
        no: { air: 10, fire: 10, earth: -10, water: -10, time: 0, timeLabel: "Years, before civilization" }
      },
      description: { yes: "Scare hell out of them! Paul was really upset that didn't get the apple! Plus, in that way, humans will evolve and keep consiousness evolving", no: "Let them bond with nature, less fire, more peace and calm, they suffered enough, Universia" },
      color: { yes: 'red', no: 'green' }
    },
    {
      id: 17,
      image: '/universia.png',
      question: "NEXT EVENTS OF THE GAME ARE NOT WRITTEN YET",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" }
      },
      description: { yes: "Ok...", no: "Ok..." },
      color: { yes: 'red', no: 'green' }
    },



    {
      id: 1000,
      image: '/universia.png',
      question: "NEXT EVENTS OF THE GAME ARE NOT WRITTEN YET",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" }
      },
      description: { yes: "Ok...", no: "Ok..." },
      color: { yes: 'red', no: 'green' }
    },
    {
      id: 1001,
      image: '/universia.png',
      question: "NEXT EVENTS OF THE GAME ARE NOT WRITTEN YET",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" }
      },
      description: { yes: "Ok...", no: "Ok..." },
      color: { yes: 'red', no: 'green' }
    },
    {
      id: 1002,
      image: '/universia.png',
      question: "NEXT EVENTS OF THE GAME ARE NOT WRITTEN YET",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" }
      },
      description: { yes: "Ok...", no: "Ok..." },
      color: { yes: 'red', no: 'green' }
    },
    {
      id: 1003,
      image: '/universia.png',
      question: "NEXT EVENTS OF THE GAME ARE NOT WRITTEN YET",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" }
      },
      description: { yes: "Ok...", no: "Ok..." },
      color: { yes: 'red', no: 'green' }
    },
    {
      id: 1004,
      image: '/universia.png',
      question: "THE GAME WILL GO FROM START. STATS WILL BE SAVED.",
      effects: {
        yes: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" },
        no: { air: 0, fire: 0, earth: 0, water: 0, time: 0, timeLabel: "???" }
      },
      description: { yes: "Ok...", no: "Ok..." },
      color: { yes: 'red', no: 'green' }
    }
  ];