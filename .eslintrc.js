[
    {
        "files": ["**/*.js"],
        "languageOptions": {
            "ecmaVersion": 2021,
            "sourceType": "module",
            "globals": {
                "require": true,
                "module": true,
                "exports": true,
                "__dirname": true,
                "__filename": true
            }
        },
        "plugins": {
            "prettier": "eslint-plugin-prettier"
        },
        "rules": {
            "no-var": "error",
            "no-multiple-empty-lines": "error",
            "eqeqeq": "error",
            "linebreak-style": 0,
            "no-unused-vars": "off",
            "no-useless-catch": "off",
            "prettier/prettier": [
                "error",
                {
                    "endOfLine": "auto"
                }
            ]
        }
    },
    {
        "files": ["*.cjs"],
        "languageOptions": {
            "ecmaVersion": 2021,
            "sourceType": "script",
            "parser": "@babel/eslint-parser",
            "parserOptions": {
                "requireConfigFile": false
            }
        },
        "rules": {
            // CommonJS 파일에 대한 별도의 규칙을 여기에 추가할 수 있습니다.
        }
    }
]
