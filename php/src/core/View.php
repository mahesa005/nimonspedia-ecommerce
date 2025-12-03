<?php
namespace App\Core;

class View {
    protected string $base_path;

    protected array $data = [];

    public function __construct() {
        $this->base_path = __DIR__ . '/../views/';
    }

    public function setData(string $key, $value): void {
        $this->data[$key] = $value;
    }

    public function renderPage(string $viewFile, string $layoutFile = 'main.php'): void {
        extract($this->data);

        $content_path = $this->base_path . $viewFile;
        
        $layout_path = $this->base_path . 'layouts/' . $layoutFile;

        ob_start();
        
        if (file_exists($content_path)) {
            require $content_path;
        } else {
            echo "Error: View file not found ($content_path)";
        }
        
        $content = ob_get_clean();

        require $layout_path;
    }

    public static function renderComponent(string $componentFile, array $data = []): string {
        extract($data);

        $base_path = __DIR__ . '/../views/components/';

        $component_path = $base_path . $componentFile;

        ob_start();
        
        if (file_exists($component_path)) {
            require $component_path;
        } else {
            echo "Error: Component file not found ($component_path)";
        }
        
        return ob_get_clean();
    }
}