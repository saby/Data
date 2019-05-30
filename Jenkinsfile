node ('controls') {
def version = "19.320"
def workspace = "/home/sbis/workspace/types_${version}/${BRANCH_NAME}"
    ws (workspace){
        deleteDir()
        checkout([$class: 'GitSCM',
            branches: [[name: "rc-${version}"]],
            doGenerateSubmoduleConfigurations: false,
            extensions: [[
                $class: 'RelativeTargetDirectory',
                relativeTargetDir: "jenkins_pipeline"
                ]],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: CREDENTIAL_ID_GIT,
                    url: "${GIT}:sbis-ci/jenkins_pipeline.git"]]
                                    ])
        helper = load "./jenkins_pipeline/platforma/branch/helper"
        start = load "./jenkins_pipeline/platforma/branch/JenkinsfileTypes"
        run_unit = load "./jenkins_pipeline/platforma/branch/run_unit"
        timeout(time: 60, unit: 'MINUTES') {
            start.start(version, workspace, helper)
        }
    }
}
