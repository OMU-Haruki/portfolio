// トップへ戻るボタンの機能
document.addEventListener('DOMContentLoaded', function() {
    // トップへ戻るボタンを作成
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.setAttribute('aria-label', 'トップへ戻る');
    backToTopButton.title = 'トップへ戻る';
    
    // ボタンをページに追加
    document.body.appendChild(backToTopButton);
    
    // スクロール位置を監視
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 300px以上スクロールしたらボタンを表示
        if (scrollTop > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // ボタンクリック時のスムーススクロール
    backToTopButton.addEventListener('click', function() {
        // スムーズにトップへスクロール
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// ナビゲーションリンクのスムーススクロール機能も追加
document.addEventListener('DOMContentLoaded', function() {
    // ページ内リンクにスムーススクロールを適用
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // ヘッダー分のオフセット
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// 画像ギャラリー機能
document.addEventListener('DOMContentLoaded', function() {
    // グローバル変数
    window.currentImageIndex = 0;
    window.currentImages = [];
    
    // モーダルを作成
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img class="modal-image" src="" alt="">
                <div class="modal-navigation">
                    <button class="modal-prev" aria-label="前の画像">‹</button>
                    <span class="modal-counter"></span>
                    <button class="modal-next" aria-label="次の画像">›</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }
    
    // モーダルを取得または作成
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = createModal();
    }
    
    const modalImage = modal.querySelector('.modal-image');
    const modalClose = modal.querySelector('.modal-close');
    const modalPrev = modal.querySelector('.modal-prev');
    const modalNext = modal.querySelector('.modal-next');
    const modalCounter = modal.querySelector('.modal-counter');
    
    // プロジェクト画像にクリックイベントを追加（単一画像とカルーセルの両方に対応）
    const projectImages = document.querySelectorAll('.project-images img:not(.carousel-image)');
    
    projectImages.forEach(function(img, index) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            // 同じプロジェクト内の全ての画像を取得
            const projectContainer = this.closest('.project');
            const imagesInProject = projectContainer.querySelectorAll('.project-images img:not(.carousel-image)');
            
            window.currentImages = Array.from(imagesInProject);
            window.currentImageIndex = window.currentImages.indexOf(this);
            
            window.showModal();
            window.updateModalImage();
        });
    });
    
    // モーダルを表示（公開関数）
    window.showModal = function() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // スクロールを無効化
    }
    
    // モーダル画像更新（公開関数）
    window.updateModalImage = function() {
        if (window.currentImages.length > 0) {
            modalImage.src = window.currentImages[window.currentImageIndex].src;
            modalImage.alt = window.currentImages[window.currentImageIndex].alt;
            modalCounter.textContent = `${window.currentImageIndex + 1} / ${window.currentImages.length}`;
            
            // ナビゲーションボタンの表示制御
            if (window.currentImages.length === 1) {
                modalPrev.style.display = 'none';
                modalNext.style.display = 'none';
            } else {
                modalPrev.style.display = 'block';
                modalNext.style.display = 'block';
            }
        }
    }
    
    // 前の画像
    function showPrevImage() {
        window.currentImageIndex = (window.currentImageIndex - 1 + window.currentImages.length) % window.currentImages.length;
        window.updateModalImage();
    }
    
    // 次の画像
    function showNextImage() {
        window.currentImageIndex = (window.currentImageIndex + 1) % window.currentImages.length;
        window.updateModalImage();
    }
    
    // モーダルを非表示
    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // スクロールを有効化
    }
    
    // イベントリスナー
    modalClose.addEventListener('click', hideModal);
    modalPrev.addEventListener('click', showPrevImage);
    modalNext.addEventListener('click', showNextImage);
    
    // モーダル背景をクリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // キーボードナビゲーション
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex') {
            switch(e.key) {
                case 'Escape':
                    hideModal();
                    break;
                case 'ArrowLeft':
                    if (window.currentImages.length > 1) showPrevImage();
                    break;
                case 'ArrowRight':
                    if (window.currentImages.length > 1) showNextImage();
                    break;
            }
        }
    });
});

// 画像カルーセル機能
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.image-carousel');
    
    carousels.forEach(function(carousel) {
        const images = JSON.parse(carousel.dataset.images);
        const carouselImage = carousel.querySelector('.carousel-image');
        const prevButton = carousel.querySelector('.carousel-prev');
        const nextButton = carousel.querySelector('.carousel-next');
        const dots = carousel.querySelectorAll('.dot');
        let currentIndex = 0;
        
        // 画像が1枚の場合はナビゲーションを非表示
        if (images.length <= 1) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            carousel.querySelector('.carousel-dots').style.display = 'none';
            return;
        }
        
        // 画像を更新する関数
        function updateImage(index) {
            currentIndex = index;
            carouselImage.src = images[currentIndex].src;
            carouselImage.alt = images[currentIndex].alt;
            
            // ドットの更新
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
        
        // 前の画像
        function showPrevImage() {
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage(newIndex);
        }
        
        // 次の画像
        function showNextImage() {
            const newIndex = (currentIndex + 1) % images.length;
            updateImage(newIndex);
        }
        
        // イベントリスナー
        prevButton.addEventListener('click', function(e) {
            e.stopPropagation();
            showPrevImage();
        });
        
        nextButton.addEventListener('click', function(e) {
            e.stopPropagation();
            showNextImage();
        });
        
        // ドットクリック
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                updateImage(index);
            });
        });
        
        // カルーセル画像クリックでモーダルを開く（既存のモーダル機能と連携）
        carouselImage.addEventListener('click', function() {
            // プロジェクト内の全ての画像を取得（カルーセル用）
            const projectContainer = carousel.closest('.project');
            window.currentImages = images.map(img => {
                const imgElement = document.createElement('img');
                imgElement.src = img.src;
                imgElement.alt = img.alt;
                return imgElement;
            });
            window.currentImageIndex = currentIndex;
            
            if (typeof window.showModal === 'function') {
                window.showModal();
                window.updateModalImage();
            }
        });
        
        // 自動切り替え（オプション - 10秒間隔）
        let autoSlideInterval;
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(showNextImage, 10000);
        }
        
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        // マウスホバーで自動切り替えを停止
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
        
        // 自動切り替えを開始
        startAutoSlide();
    });
});

// プロジェクト説明の「もっと表示する」機能
document.addEventListener('DOMContentLoaded', function() {
    const projectDescriptions = document.querySelectorAll('.project-description');
    
    projectDescriptions.forEach(function(description) {
        // 説明文の長さをチェック（文字数で判定）
        const textContent = description.textContent.trim();
        const paragraphs = description.querySelectorAll('p');
        
        // 段落が3つ以上、または文字数が300文字を超える場合に機能を追加
        if (paragraphs.length >= 3 || textContent.length > 300) {
            // 初期状態で折りたたむ
            description.classList.add('collapsed');
            
            // 「もっと表示する」ボタンを作成
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-description';
            toggleButton.textContent = 'もっと表示する';
            toggleButton.setAttribute('aria-expanded', 'false');
            
            // ボタンをクリック時の動作
            toggleButton.addEventListener('click', function() {
                const isCollapsed = description.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // 展開
                    description.classList.remove('collapsed');
                    toggleButton.textContent = '表示を戻す';
                    toggleButton.setAttribute('aria-expanded', 'true');
                } else {
                    // 折りたたみ
                    description.classList.add('collapsed');
                    toggleButton.textContent = 'もっと表示する';
                    toggleButton.setAttribute('aria-expanded', 'false');
                    
                    // 折りたたんだ際にその位置まで自動スクロール
                    description.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
            
            // ボタンを説明文の後に挿入
            description.parentNode.insertBefore(toggleButton, description.nextSibling);
        }
    });
});
