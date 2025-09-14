# 更新履歴

## [1.2.1](https://github.com/umezawakanta/work-time-tracker/compare/v1.2.0...v1.2.1) (2025-09-14)


### Bug Fixes

* resolve Jest dependency conflict by downgrading jest-watch-typea… ([27f611f](https://github.com/umezawakanta/work-time-tracker/commit/27f611fd5f55315530b0414335808fb4f1cf09d8))
* resolve Jest dependency conflict by downgrading jest-watch-typeahead ([27365b6](https://github.com/umezawakanta/work-time-tracker/commit/27365b6b1829e1dc22086bb6be009941b11ba016))

## [1.2.0](https://github.com/umezawakanta/work-time-tracker/compare/v1.1.3...v1.2.0) (2025-09-11)


### Features

* optimize Vercel build by excluding unused APIs ([292e7cf](https://github.com/umezawakanta/work-time-tracker/commit/292e7cf5065e774cb39354d1520ec57d716fc3a2))


### Bug Fixes

* add missing jsonwebtoken dependency ([e9bed25](https://github.com/umezawakanta/work-time-tracker/commit/e9bed257076b87cb836cd4dce5b265e05f31c8f9))
* add missing jwt import in login handler ([ff07c22](https://github.com/umezawakanta/work-time-tracker/commit/ff07c2286bef06d8c05e5204951a150681635924))
* convert Jest config files to ES module format ([a6d6ac8](https://github.com/umezawakanta/work-time-tracker/commit/a6d6ac8ab8fc4081c449bde600f5561306916644))
* remove .ts extension from dynamic imports for consistency ([e4ba518](https://github.com/umezawakanta/work-time-tracker/commit/e4ba518b6c8d8b0f83b9d329cd71966704495117))
* **tests:** add new test files and update ResetPassword suite ([91dff48](https://github.com/umezawakanta/work-time-tracker/commit/91dff487cd0dcca909f3241788ef653ce841c1a0))
* **tests:** improve test readability and API response handling ([59affbb](https://github.com/umezawakanta/work-time-tracker/commit/59affbbae764a447ab916478a85cb2200c2018ab))
* **tests:** skip E2E tests and enhance MongoDB connection handling ([99a4b75](https://github.com/umezawakanta/work-time-tracker/commit/99a4b75750cf65f221145577fe5906bd93847eed))
* update dev-status and test-summary timestamps and findings ([7c9e715](https://github.com/umezawakanta/work-time-tracker/commit/7c9e715ddc43128e7f6559873d9614dbd3663706))
* update pnpm-lock.yaml to resolve CI build errors ([97273c7](https://github.com/umezawakanta/work-time-tracker/commit/97273c7431273c30c673fc04a9b2c6481f5c5ff7))

## [1.1.3](https://github.com/umezawakanta/work-time-tracker/compare/v1.1.2...v1.1.3) (2025-09-09)


### Bug Fixes

* **eslint:** update ESLint configuration for improved TypeScript support ([0b2476e](https://github.com/umezawakanta/work-time-tracker/commit/0b2476e931bc810b96cf9eb197d2a103db59b635))
* **tests:** skip certain test suites to streamline testing process ([8a329f8](https://github.com/umezawakanta/work-time-tracker/commit/8a329f8f313cd30fef8581592f3aff2609525698))
* **tests:** update Jest configuration and improve test mock handling ([bc3c4ae](https://github.com/umezawakanta/work-time-tracker/commit/bc3c4aed054ac5d1224f87e1cc92291796652ed8))

## [1.1.2](https://github.com/umezawakanta/work-time-tracker/compare/v1.1.1...v1.1.2) (2025-09-09)


### Bug Fixes

* **ci:** use .npmrc for bulletproof pnpm store configuration ([5bc5eca](https://github.com/umezawakanta/work-time-tracker/commit/5bc5eca0acdd36a4353b44ef8de70e5d377c9bf7))
* **tests:** align UI text with test expectations ([98a1d25](https://github.com/umezawakanta/work-time-tracker/commit/98a1d25814ebced8134bca35a6240e16bc43329e))
* **tests:** comprehensive test fixes for remaining failures ([a2c8b2e](https://github.com/umezawakanta/work-time-tracker/commit/a2c8b2e6aebd19332c4af10b54a7b9b105e5ffc8))
* **tests:** comprehensive test fixes for UI text alignment and API error handling ([23202a8](https://github.com/umezawakanta/work-time-tracker/commit/23202a8a11ad9b4642aa42b9177f9761c02aaaeb))
* **tests:** implement defensive programming for API calls ([d627797](https://github.com/umezawakanta/work-time-tracker/commit/d627797dee5428315b7af13efc60c1d80b982c23))
* **ui:** improve text formatting and ensure newline consistency ([5132c3b](https://github.com/umezawakanta/work-time-tracker/commit/5132c3b98355c03921cc1e90e20390e686321ae5))

## [1.1.1](https://github.com/umezawakanta/work-time-tracker/compare/v1.1.0...v1.1.1) (2025-09-09)


### Bug Fixes

* **ci:** streamline pnpm setup in CI workflow ([5660283](https://github.com/umezawakanta/work-time-tracker/commit/5660283577f1d81f55cb11f939ce3380b8737d44))

## [1.1.0](https://github.com/umezawakanta/work-time-tracker/compare/v1.0.0...v1.1.0) (2025-09-09)


### Features

* add FocusPage for Impulse Control feature ([d0f9ce1](https://github.com/umezawakanta/work-time-tracker/commit/d0f9ce1b633aa502d0fd79f7ba798db6321b02a6))


### Bug Fixes

* **ci:** resolve EACCES error by using Corepack instead of pnpm/action-setup ([a11212b](https://github.com/umezawakanta/work-time-tracker/commit/a11212b0f6589b91ef4acc507066d151b44f8c73))
* **ci:** resolve EACCES error by using Corepack instead of pnpm/action-setup ([09eb9a6](https://github.com/umezawakanta/work-time-tracker/commit/09eb9a6934b1cbce79347c623c9c2aa484f23e5e))
* **ci:** resolve EACCES error in post-to-x workflow ([524f495](https://github.com/umezawakanta/work-time-tracker/commit/524f495af350f7c614371342f1e0310a01f3224e))
* **ci:** resolve ERR_PNPM_ADDING_TO_ROOT by fixing dependencies ([70cf792](https://github.com/umezawakanta/work-time-tracker/commit/70cf7920e5e38838b81c0c2beab1656c589a248e))
* **ci:** resolve lint failures by using lint:ci and Node 20 ([7477530](https://github.com/umezawakanta/work-time-tracker/commit/7477530bb60ebf37cfeba2e14b1292d484e2778b))
* **ci:** update Node version and streamline dependency installation ([58935e5](https://github.com/umezawakanta/work-time-tracker/commit/58935e5f2bed4305418fea0c4a372cce9ae2c348))

## 1.0.0 (2025-09-09)


### Features

* add Impulse Control features to featuresRegistry ([a5a548c](https://github.com/umezawakanta/work-time-tracker/commit/a5a548c396fd9f8ce2550d4ca0b8ab505bb5ea2e))
* **admin-dashboard:** add feature list tab and content to AdminDashboard with access control ([98cdb92](https://github.com/umezawakanta/work-time-tracker/commit/98cdb9214550927dff0430d1d5e8e0535ac521d4))
* **admin-dashboard:** add new time period switch features for admin dashboard with access control ([a25b1f1](https://github.com/umezawakanta/work-time-tracker/commit/a25b1f1f5516b857bf713ab3c623c68551d98692))
* **admin-dashboard:** implement feature access control for buttons and tabs in AdminDashboard ([282209d](https://github.com/umezawakanta/work-time-tracker/commit/282209d8a4550423eebaafbcd7e1b9be5e14bca6))
* **api:** enhance subscription endpoints with Stripe integration for checkout, portal, and status retrieval, including fallback handling for error scenarios ([cb05036](https://github.com/umezawakanta/work-time-tracker/commit/cb05036130c894d9cf615f1be85e9b66d05df157))
* **api:** implement automatic error reporting for request and response interceptors ([a1bc51e](https://github.com/umezawakanta/work-time-tracker/commit/a1bc51eb3d78f80e6d74c64f7bf06006379ecc66))
* **api:** implement new endpoints for error reports, metrics, and analytics with CORS support and improved error handling ([e73fbd7](https://github.com/umezawakanta/work-time-tracker/commit/e73fbd7c53d79db238a5c1b0ca452acabffdde31))
* **api:** implement subscription endpoints with CORS support and basic request handling for checkout, cancel, portal, and status ([f4a6022](https://github.com/umezawakanta/work-time-tracker/commit/f4a60222f19c130f8291f10e4ecb84f3ba8147d0))
* **bug-list:** enhance bug model with additional fields and improve bug creation logic ([4896e36](https://github.com/umezawakanta/work-time-tracker/commit/4896e36a3e1ebfaf14d5ce2473d49b90cdc4674b))
* **bug-list:** implement bug management API with CRUD operations and deduplication logic ([0e0dc4a](https://github.com/umezawakanta/work-time-tracker/commit/0e0dc4a056794254cef874440bc4b52c1d086b68))
* **bug-list:** implement minimal bugs list API returning an empty array to unblock UI ([8256979](https://github.com/umezawakanta/work-time-tracker/commit/82569796055e5710b7d8e69676bcd8a2542388cc))
* **features:** add admin title display feature with access control in AdminDashboard ([c597e5d](https://github.com/umezawakanta/work-time-tracker/commit/c597e5d4dbe706e0074a1b72561b3103e35e3a25))
* **features:** add integration test specification to feature artifacts for enhanced documentation and clarity ([af7fc38](https://github.com/umezawakanta/work-time-tracker/commit/af7fc388a1cada386b80727eceb6bfa876e9b3de))
* **features:** add new admin dashboard features including overview, user management, and analytics ([a355a38](https://github.com/umezawakanta/work-time-tracker/commit/a355a380fe97ee7acfe1995c966d9c3eb54f39e7))
* **features:** add unit test specification to feature artifacts for improved documentation and clarity ([a48512a](https://github.com/umezawakanta/work-time-tracker/commit/a48512a8302f7030be7a471a3b2aafdcae584b9e))
* **features:** update feature status and add new last updated display feature for admin dashboard with access control ([d938bcb](https://github.com/umezawakanta/work-time-tracker/commit/d938bcb0a25c95e2efcdb80ae4f804a9c6908156))
* **features:** update subscription feature status to system_testing and adjust target release date ([fbae1ab](https://github.com/umezawakanta/work-time-tracker/commit/fbae1abe7de589d3e8a14c021430eb8115116ecb))
* implement complete sitemap page with featuresRegistry integration ([2bcd415](https://github.com/umezawakanta/work-time-tracker/commit/2bcd4155f6141d686007ff749a50a4ed37932d5e))
* implement Dopamine Guard feature with context and routing ([7b2affb](https://github.com/umezawakanta/work-time-tracker/commit/7b2affbd4518131786552cd5c380ba848d83ef80))
* implement mobile-optimized header for Daily10TasksPage ([7e89467](https://github.com/umezawakanta/work-time-tracker/commit/7e8946701e5f1719a648fdf9fc7e0f2c60227e97))
* integrate existing header elements into MobileHeader ([4512305](https://github.com/umezawakanta/work-time-tracker/commit/4512305637167d52e924a2032c0c022b0c6ed8ef))
* optimize AnalyticsDashboard mobile UI ([1f7c7c7](https://github.com/umezawakanta/work-time-tracker/commit/1f7c7c7ea403b4fe751672586710fea58c4a145f))
* **share:** update share functionality to use async text generation and include open bug count ([0300ab4](https://github.com/umezawakanta/work-time-tracker/commit/0300ab46b2d7970f4c9e60ba320a3b56f7498fa7))
* **subscription:** add cancelAtPeriodEnd flag to subscription status and update UI to reflect cancellation status ([9b5e19e](https://github.com/umezawakanta/work-time-tracker/commit/9b5e19e043c46dc970b93491f6ed810ad3a952a7))
* **subscription:** add comprehensive subscription management endpoints and data structures for improved functionality ([5aeb582](https://github.com/umezawakanta/work-time-tracker/commit/5aeb582a596e71156035db5b104d98a7a4f89545))
* **subscription:** add lazy loading for SubscriptionManagement component to optimize performance ([b18745b](https://github.com/umezawakanta/work-time-tracker/commit/b18745b580e5d21d7ca5670e962bfe6fb74fcd76))
* **subscription:** add payment gateway status display and synchronization functionality ([3045eaf](https://github.com/umezawakanta/work-time-tracker/commit/3045eafd7e3ebf73d86177dfd599ab74ee88a669))
* **subscription:** add portal mode view for managing payment information with navigation options ([ad9e5b2](https://github.com/umezawakanta/work-time-tracker/commit/ad9e5b26e07e15541f59d1b76dfc9a48db24d46c))
* **subscription:** implement immediate subscription creation and activation for local development ([6f43ecc](https://github.com/umezawakanta/work-time-tracker/commit/6f43ecc00d8622cde4d4162c4574d6035cc7745d))
* **subscription:** implement subscription status fetching and management features for improved user experience ([c8e1507](https://github.com/umezawakanta/work-time-tracker/commit/c8e150707f20e019c07b65268fcc4540fee994d5))
* **subscription:** implement user subscription management endpoints with CRUD operations and mock data handling ([b05ebd8](https://github.com/umezawakanta/work-time-tracker/commit/b05ebd8b1c66cd40f12cb2bd002974f28ef54a93))
* **subscription:** integrate subscription gateway API for enhanced user experience and management options ([e90f0fc](https://github.com/umezawakanta/work-time-tracker/commit/e90f0fc4d84d41d8e865ac78e8962a95c87bc955))
* **subscription:** per-user Stripe linkage via JWT + Mongo; remove env-customer fallback ([0f2bb25](https://github.com/umezawakanta/work-time-tracker/commit/0f2bb258166f13258b61a04cf53c4a284d374eca))
* **subscription:** refactor SubscriptionManagementPage import and integrate AdminUserSubscriptionPanel for enhanced user management ([79c50bf](https://github.com/umezawakanta/work-time-tracker/commit/79c50bfa62c931f69327c6a414d0a5cc8b74aa02))
* **subscription:** remove mocks and wire real Stripe behaviors for status/checkout/portal/cancel ([42ebb33](https://github.com/umezawakanta/work-time-tracker/commit/42ebb334535eeebe75d7fa50a3dfb82c931b44a6))


### Bug Fixes

* add explicit nodejs20.x runtime to vercel.json functions ([22c8522](https://github.com/umezawakanta/work-time-tracker/commit/22c852297191dc2c0949d4d8f08cf34a19266831))
* **admin:** update dependency in AdminUserSubscriptionPanel to reload on user ID change for improved data consistency ([2fec91c](https://github.com/umezawakanta/work-time-tracker/commit/2fec91cf6bd66ae8d77780fa72731e4711a26909))
* **api:** add detailed logging for database connection loading in health endpoint to aid debugging ([e9fdca0](https://github.com/umezawakanta/work-time-tracker/commit/e9fdca08229fe369aa9bcbefd7d62edc83b29e6a))
* **api:** add detailed logging for user lookup in login endpoint to enhance debugging and traceability ([9d953d7](https://github.com/umezawakanta/work-time-tracker/commit/9d953d704d2f3f35036d3a81b8ccd3dd79a07fbb))
* **api:** configure Vercel functions for authentication and database status APIs with necessary file inclusions ([0a98936](https://github.com/umezawakanta/work-time-tracker/commit/0a989369c228d979015fe6c935a973d0ea5e9f3d))
* **api:** enhance database connection logging and error handling across health, login, and register endpoints ([78a736f](https://github.com/umezawakanta/work-time-tracker/commit/78a736f2e5fb2bbc501eb2e1280542e4dcd81eeb))
* **api:** enhance error handling in authentication and database status APIs by refining response structures and adding validation checks ([765ae93](https://github.com/umezawakanta/work-time-tracker/commit/765ae932e6c05fecd3b22278da84ab4a4c94dc1b))
* **api:** enhance error logging in health and login endpoints with detailed messages for improved debugging ([b38d12d](https://github.com/umezawakanta/work-time-tracker/commit/b38d12dc83fd09a29659ac41b5bcc19c31450a95))
* **api:** enhance health endpoint with additional logging and direct MongoDB connection fallback for improved error handling ([dcb86ba](https://github.com/umezawakanta/work-time-tracker/commit/dcb86ba16ad159fb36c4a6e49c4c0d57fe0af807))
* **api:** enhance logging in register endpoint for user and subscription model operations to improve traceability and debugging ([31a58c5](https://github.com/umezawakanta/work-time-tracker/commit/31a58c59d4d996f50e75c98d2c48a700acac1e10))
* **api:** ensure fallback User model in login endpoint to improve resilience and error handling ([5ab7330](https://github.com/umezawakanta/work-time-tracker/commit/5ab7330d05cb9a90df91ce6c0c399364d7264290))
* **api:** implement direct database connection logic and ensure default DB name for MongoDB URI ([1fdbab6](https://github.com/umezawakanta/work-time-tracker/commit/1fdbab65c15895884ac7d95d895a1c8186b96325))
* **api:** implement direct MongoDB connection fallback in health, login, register, and refresh endpoints for improved resilience ([600b8e4](https://github.com/umezawakanta/work-time-tracker/commit/600b8e4fbcde5fabda2282bf3111cbdd17134682))
* **api:** implement dynamic import for database connection in status API to improve module loading and error handling ([d9ba0b4](https://github.com/umezawakanta/work-time-tracker/commit/d9ba0b4b0e93aa7d9091e9bf79f24de8ec4492e6))
* **api:** implement fallback user and subscription models in auth endpoints to enhance resilience and error handling ([2417dc8](https://github.com/umezawakanta/work-time-tracker/commit/2417dc8ac4d6ce07528c18621337709cb52e8e48))
* **api:** implement mock endpoints for analytics and notifications with CORS support and improved error handling ([0714310](https://github.com/umezawakanta/work-time-tracker/commit/07143104dde417c8bfbf16a8c59a424ff32e55b8))
* **api:** improve error handling in subscription management by adding validation checks and fallback mechanisms ([5ad447c](https://github.com/umezawakanta/work-time-tracker/commit/5ad447cf61945e742d51f82aed340a6a98c2365a))
* **api:** improve error logging for database connections in health, login, register, and refresh endpoints to enhance debugging and resilience ([09b31d5](https://github.com/umezawakanta/work-time-tracker/commit/09b31d527e5e9658eaa69db05c1aaec0b678196e))
* **api:** modify authentication checks to return 200 status with messages for health checks instead of 401 errors ([1227cc7](https://github.com/umezawakanta/work-time-tracker/commit/1227cc714f22e74f383451cc27ea4b0da9fa4219))
* **api:** refactor dynamic module imports for database and user models to enhance lazy-loading and error handling ([4108b50](https://github.com/umezawakanta/work-time-tracker/commit/4108b505b11e852b1a554cbd3860cdced587b51c))
* **api:** refactor MongoDB connection logic to improve database name handling and enhance connection options ([c52d8c4](https://github.com/umezawakanta/work-time-tracker/commit/c52d8c4f1598981776414b74ed7dd01080f0defd))
* **api:** refine database status API logic by improving variable naming for clarity and consistency ([488c301](https://github.com/umezawakanta/work-time-tracker/commit/488c3010c11d1d1a6433303b065887c7e55c6e0d))
* **api:** update demo login logic to disable in production environment and clarify comments for better understanding ([f207d0b](https://github.com/umezawakanta/work-time-tracker/commit/f207d0b8ca4aaf6bee75e1f29bbc6a67e8df2208))
* **api:** update hostname regex for API base URL configuration to match new deployment naming convention ([c94bbba](https://github.com/umezawakanta/work-time-tracker/commit/c94bbba8ce3d37d1cc831fbc3acfac645c9f0af0))
* **api:** update MongoDB URI validation to correctly handle query parameters in connection string ([2d29c0f](https://github.com/umezawakanta/work-time-tracker/commit/2d29c0f399c474ac5ac8f16282779565014b198d))
* **api:** update Todo ID handling to ensure consistent string conversion and add subscription management endpoints for improved feature support ([7190ec5](https://github.com/umezawakanta/work-time-tracker/commit/7190ec5a7988945e1135a0412d4303ee0e89132e))
* **auth:** implement lazy loading for server modules in registration API to enhance performance and reliability ([31afdf6](https://github.com/umezawakanta/work-time-tracker/commit/31afdf6681069250268bd4761a1c32b7c4978db0))
* **auth:** improve logout API call handling to prevent UI blocking and enhance error logging ([b7c0576](https://github.com/umezawakanta/work-time-tracker/commit/b7c0576e1a24351dc437b5995d90bbcf6bf0ff56))
* **auth:** update allowed origins for CORS and ensure hashed password is stored for user registration ([679436f](https://github.com/umezawakanta/work-time-tracker/commit/679436fe7df5a5c1be2e5f2937899f2c5925b328))
* **auth:** update CORS handling to support Vercel preview URLs and add Cache-Control header ([5b1625b](https://github.com/umezawakanta/work-time-tracker/commit/5b1625b79b8e14a2122b31646116a93096391fd7))
* **bug-list:** update default filter values to 'all' and adjust query parameters for bug fetching ([e131adc](https://github.com/umezawakanta/work-time-tracker/commit/e131adcddfdd8bbcbe0190023ab96e94f82c0a75))
* completely hide desktop header on mobile to resolve double header issue ([a806c2a](https://github.com/umezawakanta/work-time-tracker/commit/a806c2ae60da4f08681ee43a3ff7ceea6d4e9af6))
* **dashboard:** enhance accessibility and interactivity in DashboardGuide by adding button types, titles, and aria-labels for step navigation ([bead30c](https://github.com/umezawakanta/work-time-tracker/commit/bead30cffad2fb6cd29aea2af6e4103a0a41fe66))
* **dashboard:** improve accessibility in DashboardGuide by adding aria-label and title attributes to the close button ([f145fda](https://github.com/umezawakanta/work-time-tracker/commit/f145fda10659cd0f45eda62cff60b34a0ae01e39))
* **dialog:** update dialog content styling to improve accessibility and readability with new background and text color ([df68816](https://github.com/umezawakanta/work-time-tracker/commit/df68816d12d7239613b3efcb67f2dd90cf439ee0))
* **features:** add requirements for subscription and bug list features to enhance status tracking ([d4216f8](https://github.com/umezawakanta/work-time-tracker/commit/d4216f8ea8f7320d2da332cf642dd58aee2ed900))
* **features:** clarify subscription feature requirements and enhance risk management strategies for better compliance ([c3ca4b9](https://github.com/umezawakanta/work-time-tracker/commit/c3ca4b9def4cd71f1b12549d2a69e0a9a7f81f22))
* **features:** correct subscription feature status from 'release_pending' to 'active' for accurate tracking ([7150609](https://github.com/umezawakanta/work-time-tracker/commit/7150609e4634e6e9029accef0dabca9da0b8e782))
* **features:** enhance in-progress filter to require feature requirements for accurate status tracking ([478ec1a](https://github.com/umezawakanta/work-time-tracker/commit/478ec1a7b7ebf822406c6f51d23ed18df5d4d6e5))
* **features:** implement strict requirement approval check for in-progress feature filtering to enhance status accuracy ([b8d474d](https://github.com/umezawakanta/work-time-tracker/commit/b8d474dacf408b65721b75711286d29fc5dbfce8))
* **features:** refine subscription feature requirements and risk management strategies for improved clarity and compliance ([8629e6f](https://github.com/umezawakanta/work-time-tracker/commit/8629e6f997549ff35f9d56bf69c240c80e4bf607))
* **features:** update bugs feature status from 'release_pending' to 'complete' for accurate feature tracking ([e1d0370](https://github.com/umezawakanta/work-time-tracker/commit/e1d037041438e26bd01be7e4565621d4a0f3820e))
* **features:** update feature artifacts and statuses for subscription and bug list to improve documentation and tracking accuracy ([91ae7cb](https://github.com/umezawakanta/work-time-tracker/commit/91ae7cb9608dcb4811005cad6c573a13e6d67fee))
* **features:** update feature status to 'system_testing' for admin management metrics ([4f176cf](https://github.com/umezawakanta/work-time-tracker/commit/4f176cf97f7378621a942ceeaedae7be546b7ebb))
* **features:** update feature statuses for subscription and bug list to 'in_progress' for improved tracking accuracy ([58d57b1](https://github.com/umezawakanta/work-time-tracker/commit/58d57b1ef5ac8ce9628ab58c57dc28ab2926eefe))
* **features:** update feature statuses for subscription management to 'system_testing' and bug tracking to 'integration_testing' for accurate tracking ([a126f8e](https://github.com/umezawakanta/work-time-tracker/commit/a126f8e44d4c216f0d9807075830cfee36243f3d))
* **features:** update feature statuses to 'planning' and enhance access control logic in Layout component ([d6628fe](https://github.com/umezawakanta/work-time-tracker/commit/d6628fe5320f1354b597655c180ee2dce8417ff8))
* **features:** update registration feature status from 'system_testing' to 'complete' for accurate feature tracking ([7c18184](https://github.com/umezawakanta/work-time-tracker/commit/7c181848254ef4ea6d197dd166cca7e4f755470d))
* **features:** update status and disable feature for admin approval process ([11da660](https://github.com/umezawakanta/work-time-tracker/commit/11da6600d9db7d7028032eadaaf7a7c6455c803e))
* **features:** update subscription feature status from 'in_progress' to 'system_testing' for accurate tracking ([d542c2d](https://github.com/umezawakanta/work-time-tracker/commit/d542c2d9a533155e8b7d39a4adce375b2485870a))
* **features:** update subscription feature status from 'integration_testing' to 'system_testing' for accurate tracking ([355c7b5](https://github.com/umezawakanta/work-time-tracker/commit/355c7b5aa0be2296804f037c7f048969bc73c9ec))
* **features:** update subscription feature status from 'system_testing' to 'release_pending' for accurate tracking ([c9b62e6](https://github.com/umezawakanta/work-time-tracker/commit/c9b62e60a780f9c7dd6589d34b7088b4e34e3a73))
* **features:** update subscription feature status to 'integration_testing' for improved tracking and clarity ([6565c96](https://github.com/umezawakanta/work-time-tracker/commit/6565c962bee87f2c608868b8eac023b65dbbef04))
* **layout:** enhance feature access control logic in Layout component by updating status checks ([3474833](https://github.com/umezawakanta/work-time-tracker/commit/347483309d6c2fd688bdaa0aa1f15dde95fed7be))
* **logging:** add detailed logging in Stripe configuration and SubscriptionPage for improved debugging and traceability ([a3493e1](https://github.com/umezawakanta/work-time-tracker/commit/a3493e18c8942012f22df3a9827fe91ff4fddc70))
* **logging:** enhance Stripe configuration logging for better debugging and diagnostics ([be684cf](https://github.com/umezawakanta/work-time-tracker/commit/be684cfdec1f639b3a20af5debfc56e979288b80))
* **register:** improve accessibility of registration form by enhancing button focus styles and updating link colors for better visibility ([9e2876e](https://github.com/umezawakanta/work-time-tracker/commit/9e2876ed62076e58a894fdcbae7e1ff1f2edd0b1))
* **register:** update styling for terms and privacy links and enhance button accessibility in registration form ([e185987](https://github.com/umezawakanta/work-time-tracker/commit/e185987fbb2c0226cac05f85a5b9aa9202134c26))
* resolve double header issue and optimize mobile layout ([3cdff0b](https://github.com/umezawakanta/work-time-tracker/commit/3cdff0b6245dd87da7bb0b1a3f70e5d75c825426))
* resolve lastUpdated type error and 401 spam issue ([94c13d3](https://github.com/umezawakanta/work-time-tracker/commit/94c13d32587ebbc91edfc9edd71d9a9e0ad74465))
* **server:** disable ETag and enhance Cache-Control headers for subscription status endpoint to ensure fresh responses ([f7171dd](https://github.com/umezawakanta/work-time-tracker/commit/f7171ddb4e8cd8c89e05852cc5f5894c1a301d59))
* **stripe:** implement fallback mechanism for Stripe configuration validation to prevent client crashes in production ([77fc02c](https://github.com/umezawakanta/work-time-tracker/commit/77fc02c0fd28801187fc0b772b1ebd73970cc97c))
* **subscription:** correct user ID reference in subscription update logic ([b1df465](https://github.com/umezawakanta/work-time-tracker/commit/b1df46599056c2264d8327c985791a862bc252b4))
* **subscription:** correct user subscription update function to use the appropriate API call ([9b34b6f](https://github.com/umezawakanta/work-time-tracker/commit/9b34b6f6e8ef0e8e0c29d704fa5420d4e979c646))
* **subscription:** enhance input validation for subscription features and improve user feedback on errors ([6e13e3e](https://github.com/umezawakanta/work-time-tracker/commit/6e13e3ef8c2c37ee76e5b02d6c50217c5b7eecdc))
* **subscription:** enhance portal navigation logic to support SPA transitions for same-origin URLs ([0a5ceee](https://github.com/umezawakanta/work-time-tracker/commit/0a5ceee0efb3d634603dc69a3c5c35ad0beeca1b))
* **subscription:** ensure safe array access for subscriptions to prevent runtime errors ([0bb6276](https://github.com/umezawakanta/work-time-tracker/commit/0bb627637973f4fc232e628de11e721033c0efc0))
* **subscription:** improve card input validation and provide mock payment warning for incomplete information ([a7584ef](https://github.com/umezawakanta/work-time-tracker/commit/a7584ef4e33b163e930be4761b76550ea7c01e75))
* **subscription:** refactor user subscription API calls to use user ID instead of subscription ID ([e7ca986](https://github.com/umezawakanta/work-time-tracker/commit/e7ca9861338e43b53adb96d4b8868b0edf18eb3d))
* **subscription:** set Cache-Control header to 'no-store' for subscription status endpoint ([d310b75](https://github.com/umezawakanta/work-time-tracker/commit/d310b75012bc058f48218976b1c51ee0b5079a92))
* **subscription:** update dialog description and restructure payment information display for improved clarity and accessibility ([4defd8c](https://github.com/umezawakanta/work-time-tracker/commit/4defd8cea03d08f18fe5229c249a79c4139de671))
* **subscription:** update feature statuses and enhance progress sharing format with emojis for better clarity ([74b6993](https://github.com/umezawakanta/work-time-tracker/commit/74b69935d83d0016411bcc26a01a8f4afc4ce205))
* **subscription:** update subscription feature statuses to reflect current development state ([6e5d8f3](https://github.com/umezawakanta/work-time-tracker/commit/6e5d8f37e1e713bcd8b42da4e3c5fae683ce11c4))
* **subscription:** update subscription management status from 'planning' to 'system_testing' for accurate feature tracking ([d76df61](https://github.com/umezawakanta/work-time-tracker/commit/d76df612f438585691ee4ec4d14a795342b41965))
* **subscription:** update user subscription function to use correct user ID and improve error handling ([aff96c0](https://github.com/umezawakanta/work-time-tracker/commit/aff96c0a23d8b34ce145b86e4fce57a68ef23727))
* update header visibility and layout for improved mobile experience ([79bf6c2](https://github.com/umezawakanta/work-time-tracker/commit/79bf6c2ccbcd0105f0b27efe0f9ecd5ee6f1da51))
* **vercel:** add logic to force build for specific directories and files in Vercel deployment process ([8d15425](https://github.com/umezawakanta/work-time-tracker/commit/8d154253205e2f1b147a2b91f97dc9240b4fa3a3))
* **vercel:** consolidate file inclusion for Vercel functions to include all TypeScript files in the server directory for enhanced deployment efficiency ([fefbfe4](https://github.com/umezawakanta/work-time-tracker/commit/fefbfe487aa50561d443ba633bbad84c08f73075))
* **vercel:** remove invalid runtime field to resolve Function Runtimes error ([9ac48fc](https://github.com/umezawakanta/work-time-tracker/commit/9ac48fcb314edd50ff66ee7a6cf7872413956bb3))
* **vercel:** remove runtime specification for Vercel functions to streamline configuration ([2fd082f](https://github.com/umezawakanta/work-time-tracker/commit/2fd082f73d5b0156d89cf1c0d99263ecd850d09e))
* **vercel:** simplify file inclusion for Vercel functions by using wildcard pattern for server directory ([b6e1313](https://github.com/umezawakanta/work-time-tracker/commit/b6e13133937c00860c66dfae55a488e1a7dd211a))
* **vercel:** update file inclusion for Vercel functions to specify authentication and database files for improved deployment accuracy ([39c1293](https://github.com/umezawakanta/work-time-tracker/commit/39c12931a2e3457ee5a93c718dfde097ee5659e8))
* **vercel:** update runtime for Vercel functions from nodejs22.x to nodejs20.x for improved compatibility ([7dbab73](https://github.com/umezawakanta/work-time-tracker/commit/7dbab73eedd49bf51a688deca57f6f0410ad189c))

## v1.0.0

- 管理者ダッシュボードの実データ接続（DAU/ページビュー/Top Pages）
- モバイル最適化、バージョン/更新履歴UI、Xシェア/自動ポスト

## v0.0.1 (初期リリース)

- ホーム画面下部に「バージョン情報」と直近の更新履歴を表示
- 全更新履歴ページ `/changelog` を追加
- ビルド時に `public/version.json` と `public/changelog.json` を自動生成
- モバイル最適化（優先）: ヒーローCTAを小画面で縦積み、下部セーフエリア余白を追加

> 変更内容は日本語で記述し、バージョンごとに本ファイルへ追記します。
