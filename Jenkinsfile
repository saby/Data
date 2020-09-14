@Library('pipeline') _

def version = '20.6100'

node ('controls') {
    checkout_pipeline("20.6100/pea/test_new_ver")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}
