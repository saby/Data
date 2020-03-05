@Library('pipeline@bugfix/rev_sdk') _

def version = '20.2100'

node ('controls') {
    checkout_pipeline("20.2100/bugfix/one_jenkinsfile")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}