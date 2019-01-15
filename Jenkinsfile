node ('controls') {
def version = "19.100"
def workspace = "/home/sbis/workspace/types_${version}/${BRANCH_NAME}"
    ws (workspace){
        deleteDir()
        checkout([$class: 'GitSCM',
            branches: [[name: "19.100/feature/jp"]],
            doGenerateSubmoduleConfigurations: false,
            extensions: [[
                $class: 'RelativeTargetDirectory',
                relativeTargetDir: "jenkins_pipeline"
                ]],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: CREDENTIAL_ID_GIT,
                    url: 'git@git.sbis.ru:sbis-ci/jenkins_pipeline.git']]
                                    ])
        start = load "./jenkins_pipeline/platforma/branch/JenkinsfileTypes"
        start.start(version, BRANCH_NAME, env)
    }
}
