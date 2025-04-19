import { T, useTolgee } from "@tolgee/react";

export default function LanguageSelect() {
    const tolgee = useTolgee(["language"]);

    return (
        <div className="flex items-center space-x-2">
            <label
                htmlFor="language-select"
                className="block text-md font-medium text-gray-700 mb-1"
            >

                <T keyName="language_select_label">  Change Language   </T>

            </label>

            <select
                value={tolgee.getLanguage()}
                onChange={(e) => tolgee.changeLanguage(e.target.value)}
                className="border z-50 bg-gray-100/50 text-black rounded-md"
            >

                <option value="en">English</option>
                <option value="tr">Turkish</option>
                <option value="es-ES">Español</option>
                <option value="ar-SA">العربية</option>
                <option value="ja-JP">日本語</option>

            </select>
            
        </div>
    );
};
