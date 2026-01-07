export class CharacterClasses {
    static getStats(className, level) {
        const baseStats = {
            warrior: {
                hp: 150 + (level * 20),
                mp: 50 + (level * 5),
                attack: 15 + (level * 3),
                defense: 20 + (level * 4),
                speed: 0.8
            },
            rogue: {
                hp: 100 + (level * 15),
                mp: 80 + (level * 8),
                attack: 20 + (level * 4),
                defense: 10 + (level * 2),
                speed: 1.2
            },
            mage: {
                hp: 80 + (level * 10),
                mp: 150 + (level * 20),
                attack: 25 + (level * 5),
                defense: 5 + (level * 1),
                speed: 0.9
            },
            priest: {
                hp: 120 + (level * 18),
                mp: 120 + (level * 15),
                attack: 10 + (level * 2),
                defense: 15 + (level * 3),
                speed: 1.0
            }
        };
        
        return baseStats[className] || baseStats.warrior;
    }
    
    static getClassDescription(className) {
        const descriptions = {
            warrior: 'Especialista em combate corpo-a-corpo e defesa',
            rogue: 'Mestre da furtividade e ataques precisos',
            mage: 'Controlador de elementos e magias poderosas',
            priest: 'Curandeiro e suporte com magias divinas'
        };
        
        return descriptions[className] || '';
    }
}
